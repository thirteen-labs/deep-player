import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { EditPencil, MoreHoriz, Plus, Sparks } from 'iconoir-react-native';
import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { View } from 'react-native';

import { AppBottomSheet, AppButton, EmptyState, InfoRow, LoadingState, SectionCard } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useDbStore } from '@/lib/db/store';
import { useSortStore } from '@/stores/sort-store';

import { evaluateSmartList, getSystemSmartLists } from '../services';
import { useMediaListStore } from '../store';
import { useAdaptiveColumns, useLibraryMediaContext, useMediaLayout } from '../hooks';
import type { MediaItem, SmartList } from '../types';

import { SmartListCard } from './smart-list-card';
import { SmartListEditorSheet } from './smart-list-editor-sheet';

function orderSmartLists(
  lists: SmartList[],
  pinnedIds: string[],
  order: string[],
  sort: 'name' | 'recent' | 'type',
): SmartList[] {
  const pinned = new Set(pinnedIds);
  return [...lists].sort((a, b) => {
    const aPinned = pinned.has(a.id);
    const bPinned = pinned.has(b.id);
    if (aPinned !== bPinned) return aPinned ? -1 : 1;

    const aOrder = order.indexOf(a.id);
    const bOrder = order.indexOf(b.id);
    if (aOrder >= 0 || bOrder >= 0) {
      if (aOrder < 0) return 1;
      if (bOrder < 0) return -1;
      return aOrder - bOrder;
    }

    if (sort === 'recent') return b.createdAt - a.createdAt || a.name.localeCompare(b.name);
    if (sort === 'type') return a.section.localeCompare(b.section) || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });
}

/** Smart-list card section: logical collections evaluated from the library. */
export function SmartListsSection() {
  const tracks = useDbStore((s) => s.tracks);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const error = useDbStore((s) => s.error);
  const context = useLibraryMediaContext();

  const customLists = useMediaListStore((s) => s.customSmartLists);
  const hiddenIds = useMediaListStore((s) => s.hiddenSmartListIds);
  const pinnedIds = useMediaListStore((s) => s.pinnedSmartListIds);
  const listOrder = useMediaListStore((s) => s.smartListOrder);
  const createSmartList = useMediaListStore((s) => s.createSmartList);
  const updateSmartList = useMediaListStore((s) => s.updateSmartList);
  const toggleHidden = useMediaListStore((s) => s.toggleSmartListHidden);
  const togglePinned = useMediaListStore((s) => s.toggleSmartListPinned);
  const setListOrder = useMediaListStore((s) => s.setSmartListOrder);
  const deleteSmartList = useMediaListStore((s) => s.deleteSmartList);
  const smartSort = useSortStore((s) => s.smartListSort);

  const { layout, setLayout, preference } = useMediaLayout('smart:all', 'smart');
  const columns = useAdaptiveColumns(preference.columns);

  const [showHidden, setShowHidden] = useState(false);
  const [actionList, setActionList] = useState<SmartList | null>(null);
  const [editingList, setEditingList] = useState<SmartList | null>(null);
  const [editorVersion, setEditorVersion] = useState(0);
  const actionsRef = useRef<ComponentRef<typeof AppBottomSheet>>(null);
  const editorRef = useRef<ComponentRef<typeof AppBottomSheet>>(null);

  const allLists = useMemo(
    () => [...getSystemSmartLists(), ...customLists],
    [customLists],
  );

  const visibleLists = useMemo(
    () =>
      orderSmartLists(
        allLists.filter((list) => showHidden || !hiddenIds.includes(list.id)),
        pinnedIds,
        listOrder,
        smartSort,
      ),
    [allLists, hiddenIds, listOrder, pinnedIds, showHidden, smartSort],
  );

  const evaluated = useMemo(() => {
    const byId = new Map<string, MediaItem[]>();
    for (const list of visibleLists) byId.set(list.id, evaluateSmartList(tracks, list, context));
    return byId;
  }, [context, tracks, visibleLists]);

  const openList = (id: string) => router.push(`/smart-lists/${encodeURIComponent(id)}`);
  const openActions = (list: SmartList) => {
    setActionList(list);
    actionsRef.current?.expand();
  };
  const openEditor = (target?: SmartList) => {
    setEditingList(target ?? null);
    setEditorVersion((value) => value + 1);
    editorRef.current?.expand();
  };

  const moveList = (direction: 'up' | 'down') => {
    if (!actionList) return;
    const index = visibleLists.findIndex((list) => list.id === actionList.id);
    const target = index + (direction === 'up' ? -1 : 1);
    if (index < 0 || target < 0 || target >= visibleLists.length) {
      actionsRef.current?.close();
      return;
    }
    const next = [...visibleLists];
    [next[index], next[target]] = [next[target], next[index]];
    setListOrder(next.map((list) => list.id));
    actionsRef.current?.close();
  };

  const hasAnyHidden = hiddenIds.length > 0;
  const isEmpty = visibleLists.length === 0;

  return (
    <SectionCard
      title="Smart Lists"
      subtitle="Saved searches that update as your library changes"
      flush
      padding={Spacing.half}
      action={
        <AppButton
          label={layout === 'grid' ? 'List' : 'Grid'}
          variant="ghost"
          size="small"
          onPress={() => setLayout(layout === 'grid' ? 'list' : 'grid', preference.columns)}
        />
      }>
      {!isLoaded ? (
        <LoadingState message="Loading smart lists…" variant="block" />
      ) : error ? (
        <EmptyState message="Couldn't load smart lists" description={error} />
      ) : isEmpty ? (
        <EmptyState
          icon={Sparks}
          message="No smart lists visible"
          description="Create one, or restore the lists you hid."
          action={
            hasAnyHidden ? (
              <AppButton label="Show hidden lists" variant="ghost" onPress={() => setShowHidden(true)} />
            ) : undefined
          }
        />
      ) : (
        <>
          <FlashList
            style={styles.list}
            data={visibleLists}
            keyExtractor={(list) => list.id}
            numColumns={layout === 'grid' ? columns : 1}
            renderItem={({ item }) => (
              <View style={layout === 'grid' ? styles.gridItem : styles.listItem}>
                <SmartListCard
                  list={item}
                  items={evaluated.get(item.id) ?? []}
                  context={context}
                  hidden={hiddenIds.includes(item.id)}
                  onPress={() => openList(item.id)}
                />
                <AppButton
                  label="Options"
                  variant="ghost"
                  size="small"
                  icon={MoreHoriz}
                  onPress={() => openActions(item)}
                />
              </View>
            )}
            extraData={{ layout, hiddenIds, pinnedIds }}
          />
          <View style={styles.footer}>
            <AppButton label="New list" icon={Plus} variant="secondary" onPress={() => openEditor()} />
            {hasAnyHidden ? (
              <AppButton
                label={showHidden ? 'Hide restored' : 'Show hidden'}
                variant="ghost"
                onPress={() => setShowHidden((value) => !value)}
              />
            ) : null}
          </View>
        </>
      )}

      <AppBottomSheet
        ref={editorRef}
        title={editingList ? `Edit ${editingList.name}` : 'New smart list'}
        icon={editingList ? EditPencil : Plus}
        scrollable
        snapPoints={['90%']}>
        <SmartListEditorSheet
          key={editorVersion}
          list={editingList ?? undefined}
          onSave={(list) => {
            if (editingList) updateSmartList(list);
            else createSmartList(list);
            editorRef.current?.close();
          }}
          onCancel={() => editorRef.current?.close()}
        />
      </AppBottomSheet>

      <AppBottomSheet ref={actionsRef} title={actionList?.name ?? 'List options'} icon={Sparks}>
        {actionList ? (
          <>
            <InfoRow
              label={pinnedIds.includes(actionList.id) ? 'Unpin list' : 'Pin list'}
              icon={Sparks}
              onPress={() => {
                togglePinned(actionList.id);
                actionsRef.current?.close();
              }}
            />
            <InfoRow
              label={hiddenIds.includes(actionList.id) ? 'Show list' : 'Hide list'}
              icon={MoreHoriz}
              onPress={() => {
                toggleHidden(actionList.id);
                actionsRef.current?.close();
              }}
            />
            <InfoRow label="Move up" icon={Plus} onPress={() => moveList('up')} />
            <InfoRow label="Move down" icon={Plus} onPress={() => moveList('down')} />
            {!actionList.isSystem ? (
              <InfoRow
                label="Edit list"
                icon={EditPencil}
                onPress={() => {
                  const list = actionList;
                  actionsRef.current?.close();
                  openEditor(list);
                }}
              />
            ) : null}
            {!actionList.isSystem ? (
              <InfoRow
                label="Delete list"
                icon={MoreHoriz}
                valueColor="tint"
                onPress={() => {
                  deleteSmartList(actionList.id);
                  actionsRef.current?.close();
                }}
              />
            ) : null}
          </>
        ) : null}
      </AppBottomSheet>
    </SectionCard>
  );
}

const styles = {
  list: {
    minHeight: 240,
    flexGrow: 0,
  },
  gridItem: {
    flex: 1,
    minWidth: 0,
  },
  listItem: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
} as const;
