import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { View, ScrollView, Text, TextInput } from 'react-native';
import { BorderlessButton, RectButton } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons'

import PageHeader from '../../components/PageHeader';
import TeacherItem from '../../components/TeacherItem';

import styles from './styles';
import api from './../../services/api';
import { Teacher } from './../../components/TeacherItem/index';
import AsyncStorage from '@react-native-community/async-storage';

interface Filters {
    subject: string,
    weekDay: string,
    time: string,
}

function TeacherList(){

    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [filters, setFilters] = useState<Filters>({
        subject: '',
        weekDay: '',
        time: '',
    });

    function loadFavorites(){
        AsyncStorage.getItem('favorites').then(response => {
            if(response) {
                const favoritedTeachers = JSON.parse(response);
                const favoritedTeachersIds = favoritedTeachers.map((teacher: Teacher) => teacher.id);

                setFavorites(favoritedTeachersIds);
            }
        })
    }

    useEffect(() => {
        loadFavorites();
    }, [])

    useFocusEffect(() => {
        loadFavorites();
    })

    function handleToggleFiltersVisible(){
        setIsFilterVisible(!isFilterVisible);
    }

    async function handleFiltersSubmit(){
        loadFavorites();

        const response = await api.get('/classes', {
            params: {
                subject: filters.subject,
                week_day: filters.weekDay,
                time: filters.time,
            }
        });

        setTeachers(response.data);
        setIsFilterVisible(false);
    }

    return (
    <View style={styles.container}>
        <PageHeader 
            title="Proffys disponíveis" 
            headerRight={(
                <BorderlessButton onPress={handleToggleFiltersVisible}>
                    <Feather name="filter" size={20} color="#FFF" />
                </BorderlessButton>
            )}
        >
           { isFilterVisible && ( <View style={styles.searchForm}>
                <Text style={styles.label}>Matéria</Text>
                <TextInput 
                    style={styles.input}
                    value={filters.subject}
                    onChangeText = {text => setFilters({...filters, subject: text})}
                    placeholder="Qual a matéria?"
                    placeholderTextColor="#c1bccc"
                />

                <View style={styles.inputGroup}>
                    <View style={styles.inputBlock}>
                        <Text style={styles.label}>Dia da semana</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Qual o dia?"
                            placeholderTextColor="#c1bccc"
                            value={filters.weekDay}
                            onChangeText = {text => setFilters({...filters, weekDay: text})}
                        />
                    </View>

                    <View style={styles.inputBlock}>
                        <Text style={styles.label}>Horário</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Qual horário?"
                            placeholderTextColor="#c1bccc"
                            value={filters.time}
                            onChangeText = {text => setFilters({...filters, time: text})}
                        />
                    </View>
                </View>

                <RectButton onPress={handleFiltersSubmit} style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Filtrar</Text>
                </RectButton>
            </View>)}
        </PageHeader>

        <ScrollView 
            style={styles.teacherList}
            contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 16,
            }}
        >
        
        {teachers.map((teacher: Teacher) => {
            return ( 
            <TeacherItem 
                key={teacher.id} 
                teacher={teacher}
                favorited={favorites.includes(teacher.id)}
            />
            )
        })}
        </ScrollView>
    </View>
    );
}

export default TeacherList;