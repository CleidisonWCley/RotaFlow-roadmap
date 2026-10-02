import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { usePathname } from 'expo-router';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { AppPalette, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
    const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const isQuestionScreen = pathname === '/questions';
  

  return (
    <Tabs>
    
      <TabSlot style={{ height: '100%' }} />
      {isQuestionScreen && !isExpanded && (
        <Pressable
          accessibilityLabel="Abrir navegação"
          onPress={() => setIsExpanded(true)}
          style={({ pressed }) => [styles.collapsedButton, pressed && styles.pressed]}>
          <SymbolView name={{ ios: 'line.3.horizontal', android: 'menu', web: 'menu' }} size={22} tintColor={AppPalette.text} />
        </Pressable>
      )}
        <TabList asChild>
          <CustomTabList>
            {isQuestionScreen && (
              <Pressable
                accessibilityLabel="Recolher navegação"
                onPress={() => setIsExpanded(false)}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} tintColor={AppPalette.textSecondary} />
              </Pressable>
            )}
            <TabTrigger name="index" href="/tabs/index1"asChild>
              <TabButton icon="house">Início</TabButton>
            </TabTrigger>
            <TabTrigger name="explore" href="/tabs/explore" asChild>
              <TabButton icon="map">Trilha</TabButton>
            </TabTrigger>
            <TabTrigger name="profile" href={'/tabs/profile' as never} asChild>
              <TabButton icon="person">Perfil</TabButton>
            </TabTrigger>
            <TabTrigger name="explore" href="/questions" asChild>
             </TabTrigger>
          </CustomTabList>
        </TabList>
      
    </Tabs>
  );
}

export function TabButton({ children, isFocused, icon, ...props }: TabTriggerSlotProps & { icon: string }) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <SymbolView name={{ ios: icon as never, android: icon as never, web: icon as never }} size={18} tintColor={isFocused ? AppPalette.accent : AppPalette.textSecondary} />
      <ThemedText type="small" style={{ color: isFocused ? AppPalette.accent : AppPalette.textSecondary }}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView style={styles.innerContainer}>{props.children}</ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: { position: 'absolute', width: '100%', padding: Spacing.three, bottom:0, alignItems: 'center', flexDirection: 'row' ,justifyContent: 'center', },
  innerContainer: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.two, borderRadius: 22, flexDirection: 'row', alignItems: 'center', flexGrow: 1, gap: Spacing.one, maxWidth: MaxContentWidth, backgroundColor: AppPalette.backgroundElement },
  collapsedButton: { position: 'absolute', right: 20, bottom: 20, width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: AppPalette.accent, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  closeButton: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: AppPalette.track },
  tabButton: { paddingVertical: Spacing.one, paddingHorizontal: Spacing.three, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.one, flex: 1 },
  pressed: { opacity: 0.7 },
});
