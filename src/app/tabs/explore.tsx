import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/supabase'; 

export default function ExploreScreen() {
  const router = useRouter();
  const [trilhas, setTrilhas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrilhas() {
      try {
        setLoading(true);
        // Busca as trilhas cadastradas no Supabase
        const { data, error } = await supabase.from('trilhas').select('*');
        
        if (error) {
          console.error('Erro ao buscar trilhas no Supabase:', error.message);
          Alert.alert('Erro no Banco', error.message);
        } else if (data) {
          setTrilhas(data);
        }
      } catch (err: any) {
        console.error('Erro de conexão:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTrilhas();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0E15', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
      <View style={{ flex: 1, backgroundColor: '#0D0E15', padding: 16 }}>
        <FlatList
         data={trilhas}
           keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }} 
             renderItem={({ item }) => (
             <TouchableOpacity 
             style={{ backgroundColor: '#1A1C29', padding: 16, borderRadius: 12, marginBottom: 12 }}
             onPress={() => router.push({ pathname: '/modulos', params: { trilhaId: item.id } })}
  
  >
    <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>{item.titulo}</Text>
    <Text style={{ color: '#AAA', marginTop: 4 }}>{item.descricao}</Text>
    </TouchableOpacity>
    )}
   />
    </View>
  );
}