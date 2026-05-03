import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const COLORS = {
  gray100: '#FAFAFA',
  gray200: '#F2F2F2',
  gray300: '#DDDEDF',
  gray400: '#B9BBBC',
  gray500: '#777A7B',
  gray600: '#333638',
  gray700: '#1B1D1E',
  greenLight: '#E5F0DB',
  greenMid: '#CBE4B4',
  greenDark: '#639339',
  redLight: '#F4E6E7',
  redMid: '#F3BABD',
  redDark: '#BF3B44',
  white: '#FFFFFF',
};

const INITIAL_MEALS = [
  {
    id: '1',
    name: 'X-tudo',
    description: 'Xis completo da lancheria do bairro',
    date: '12/08/2022',
    time: '20:00',
    inDiet: false,
  },
  {
    id: '2',
    name: 'Whey protein com leite',
    description: 'Shake de whey protein batido com leite integral',
    date: '12/08/2022',
    time: '16:00',
    inDiet: true,
  },
  {
    id: '3',
    name: 'Salada cesar com frango',
    description: 'Salada cesar com frango grelhado, alface e tomate',
    date: '12/08/2022',
    time: '12:30',
    inDiet: true,
  },
  {
    id: '4',
    name: 'Vitamina de banana com aveia',
    description: 'Banana, aveia, leite e canela',
    date: '12/08/2022',
    time: '09:30',
    inDiet: true,
  },
  {
    id: '5',
    name: 'X-tudo',
    description: 'Lanche completo com queijo e molho',
    date: '11/08/2022',
    time: '20:00',
    inDiet: false,
  },
  {
    id: '6',
    name: 'Sanduiche',
    description: 'Sanduiche de pao integral com atum e salada de alface e tomate',
    date: '11/08/2022',
    time: '16:00',
    inDiet: true,
  },
];

function App() {
  const [screen, setScreen] = useState({ name: 'home' });
  const [meals, setMeals] = useState(INITIAL_MEALS);

  const stats = useMemo(() => calculateStats(meals), [meals]);
  const theme = stats.percentage >= 50 ? 'green' : 'red';

  function goHome() {
    setScreen({ name: 'home' });
  }

  function addMeal(meal) {
    setMeals((current) => [{ ...meal, id: String(Date.now()) }, ...current]);
    setScreen({ name: meal.inDiet ? 'success' : 'failure' });
  }

  function updateMeal(updatedMeal) {
    setMeals((current) =>
      current.map((meal) => (meal.id === updatedMeal.id ? updatedMeal : meal))
    );
    setScreen({ name: 'detail', mealId: updatedMeal.id });
  }

  function deleteMeal(mealId) {
    setMeals((current) => current.filter((meal) => meal.id !== mealId));
    goHome();
  }

  const selectedMeal = meals.find((meal) => meal.id === screen.mealId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={screen.name === 'home' ? COLORS.gray100 : headerColor(theme)}
      />

      {screen.name === 'home' && (
        <HomeScreen
          meals={meals}
          stats={stats}
          theme={theme}
          onAdd={() => setScreen({ name: 'create' })}
          onStats={() => setScreen({ name: 'stats' })}
          onOpenMeal={(meal) => setScreen({ name: 'detail', mealId: meal.id })}
        />
      )}

      {screen.name === 'stats' && (
        <StatsScreen stats={stats} theme={theme} onBack={goHome} />
      )}

      {screen.name === 'create' && (
        <MealFormScreen
          title="Nova refeicao"
          submitLabel="Cadastrar refeicao"
          onBack={goHome}
          onSubmit={addMeal}
        />
      )}

      {screen.name === 'success' && (
        <FeedbackScreen
          type="success"
          title="Continue assim!"
          message="Voce continua dentro da dieta. Muito bem!"
          buttonLabel="Ir para a pagina inicial"
          onDone={goHome}
        />
      )}

      {screen.name === 'failure' && (
        <FeedbackScreen
          type="failure"
          title="Que pena!"
          message="Voce saiu da dieta dessa vez, mas continue se esforcando e nao desista!"
          buttonLabel="Ir para a pagina inicial"
          onDone={goHome}
        />
      )}

      {screen.name === 'detail' && selectedMeal && (
        <MealDetailScreen
          meal={selectedMeal}
          onBack={goHome}
          onEdit={() => setScreen({ name: 'edit', mealId: selectedMeal.id })}
          onDelete={() => deleteMeal(selectedMeal.id)}
        />
      )}

      {screen.name === 'edit' && selectedMeal && (
        <MealFormScreen
          title="Editar refeicao"
          submitLabel="Salvar alteracoes"
          initialMeal={selectedMeal}
          onBack={() => setScreen({ name: 'detail', mealId: selectedMeal.id })}
          onSubmit={updateMeal}
        />
      )}
    </SafeAreaView>
  );
}

function HomeScreen({ meals, stats, theme, onAdd, onStats, onOpenMeal }) {
  const sections = groupMealsByDate(meals);
  const isGreen = theme === 'green';

  return (
    <View style={styles.screen}>
      <View style={styles.homeHeader}>
        <View style={styles.logoRow}>
          <ForkKnifeLogo />
          <View>
            <Text style={styles.logoTitle}>Daily</Text>
            <Text style={styles.logoTitle}>Diet</Text>
          </View>
        </View>

        <View style={styles.avatar}>
          <AppIcon name="user" size={18} color={COLORS.gray700} />
        </View>
      </View>

      <Pressable
        onPress={onStats}
        style={[
          styles.percentageCard,
          { backgroundColor: isGreen ? COLORS.greenLight : COLORS.redLight },
        ]}
      >
        <AppIcon
          name="arrow-up-right"
          size={22}
          color={isGreen ? COLORS.greenDark : COLORS.redDark}
          style={styles.percentageArrow}
        />
        <Text style={styles.percentageValue}>{formatPercentage(stats.percentage)}</Text>
        <Text style={styles.percentageLabel}>das refeicoes dentro da dieta</Text>
      </Pressable>

      <Text style={styles.sectionLabel}>Refeicoes</Text>
      <Button label="Nova refeicao" icon="plus" onPress={onAdd} />

      <FlatList
        data={sections}
        keyExtractor={(item) => item.date}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mealsList}
        renderItem={({ item }) => (
          <View style={styles.dayGroup}>
            <Text style={styles.dayTitle}>{item.date.replace(/\//g, '.')}</Text>
            {item.data.map((meal) => (
              <MealRow key={meal.id} meal={meal} onPress={() => onOpenMeal(meal)} />
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhuma refeicao cadastrada ainda.</Text>
          </View>
        }
      />
    </View>
  );
}

function StatsScreen({ stats, theme, onBack }) {
  const isGreen = theme === 'green';
  const backgroundColor = isGreen ? COLORS.greenLight : COLORS.redLight;

  return (
    <View style={[styles.fullScreen, { backgroundColor }]}>
      <View style={styles.statsHero}>
        <Pressable hitSlop={12} onPress={onBack} style={styles.backButton}>
          <AppIcon name="arrow-left" size={24} color={isGreen ? COLORS.greenDark : COLORS.redDark} />
        </Pressable>
        <Text style={styles.statsPercentage}>{formatPercentage(stats.percentage)}</Text>
        <Text style={styles.percentageLabel}>das refeicoes dentro da dieta</Text>
      </View>

      <View style={styles.statsBody}>
        <Text style={styles.statsTitle}>Estatisticas gerais</Text>

        <InfoBox value={stats.bestSequence} label="melhor sequencia de pratos dentro da dieta" />
        <InfoBox value={stats.total} label="refeicoes registradas" />

        <View style={styles.twoColumns}>
          <InfoBox
            value={stats.inside}
            label="refeicoes dentro da dieta"
            style={{ flex: 1, backgroundColor: COLORS.greenLight }}
          />
          <InfoBox
            value={stats.outside}
            label="refeicoes fora da dieta"
            style={{ flex: 1, backgroundColor: COLORS.redLight }}
          />
        </View>
      </View>
    </View>
  );
}

function MealFormScreen({ title, submitLabel, initialMeal, onBack, onSubmit }) {
  const [name, setName] = useState(initialMeal?.name || '');
  const [description, setDescription] = useState(initialMeal?.description || '');
  const [date, setDate] = useState(initialMeal?.date || '');
  const [time, setTime] = useState(initialMeal?.time || '');
  const [inDiet, setInDiet] = useState(initialMeal?.inDiet ?? null);

  function submit() {
    if (!name.trim() || !description.trim() || !date.trim() || !time.trim() || inDiet === null) {
      Alert.alert('Campos obrigatorios', 'Preencha todos os campos antes de continuar.');
      return;
    }

    onSubmit({
      id: initialMeal?.id,
      name: name.trim(),
      description: description.trim(),
      date: date.trim(),
      time: time.trim(),
      inDiet,
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.fullScreen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.formHeader}>
        <Pressable hitSlop={12} onPress={onBack} style={styles.backButton}>
          <AppIcon name="arrow-left" size={24} color={COLORS.gray600} />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <ScrollView
        style={styles.formBody}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        <Input label="Nome" value={name} onChangeText={setName} />
        <Input
          label="Descricao"
          value={description}
          onChangeText={setDescription}
          multiline
          style={styles.textArea}
        />

        <View style={styles.row}>
          <Input
            label="Data"
            value={date}
            onChangeText={setDate}
            placeholder="12/08/2022"
            style={styles.flexInput}
          />
          <Input
            label="Hora"
            value={time}
            onChangeText={setTime}
            placeholder="16:00"
            style={styles.flexInput}
          />
        </View>

        <Text style={styles.inputLabel}>Esta dentro da dieta?</Text>
        <View style={styles.row}>
          <DietOption
            label="Sim"
            selected={inDiet === true}
            color={COLORS.greenDark}
            background={COLORS.greenLight}
            onPress={() => setInDiet(true)}
          />
          <DietOption
            label="Nao"
            selected={inDiet === false}
            color={COLORS.redDark}
            background={COLORS.redLight}
            onPress={() => setInDiet(false)}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label={submitLabel} onPress={submit} />
      </View>
    </KeyboardAvoidingView>
  );
}

function FeedbackScreen({ type, title, message, buttonLabel, onDone }) {
  const isSuccess = type === 'success';

  return (
    <View style={styles.feedbackScreen}>
      <Text style={[styles.feedbackTitle, { color: isSuccess ? COLORS.greenDark : COLORS.redDark }]}>
        {title}
      </Text>
      <Text style={styles.feedbackText}>{message}</Text>

      <View style={styles.illustration}>
        <View style={[styles.illustrationShadow, { backgroundColor: isSuccess ? '#DDEBD1' : '#DAD6E1' }]} />
        <View style={styles.head} />
        <View style={styles.bodyLine} />
        <View style={[styles.arm, styles.leftArm]} />
        <View style={[styles.arm, styles.rightArm]} />
        <View style={[styles.leg, styles.leftLeg]} />
        <View style={[styles.leg, styles.rightLeg]} />
      </View>

      <Button label={buttonLabel} onPress={onDone} style={styles.feedbackButton} />
    </View>
  );
}

function MealDetailScreen({ meal, onBack, onEdit, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const isInDiet = meal.inDiet;

  return (
    <View style={[styles.fullScreen, { backgroundColor: isInDiet ? COLORS.greenLight : COLORS.redLight }]}>
      <View style={styles.detailHeader}>
        <Pressable hitSlop={12} onPress={onBack} style={styles.backButton}>
          <AppIcon name="arrow-left" size={24} color={COLORS.gray600} />
        </Pressable>
        <Text style={styles.headerTitle}>Refeicao</Text>
      </View>

      <View style={styles.detailBody}>
        <Text style={styles.detailTitle}>{meal.name}</Text>
        <Text style={styles.detailDescription}>{meal.description}</Text>

        <Text style={styles.detailSection}>Data e hora</Text>
        <Text style={styles.detailDate}>{meal.date} as {meal.time}</Text>

        <View style={styles.badge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isInDiet ? COLORS.greenDark : COLORS.redDark },
            ]}
          />
          <Text style={styles.badgeText}>{isInDiet ? 'dentro da dieta' : 'fora da dieta'}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Editar refeicao" icon="edit-3" onPress={onEdit} />
        <Button
          label="Excluir refeicao"
          icon="trash-2"
          variant="outline"
          onPress={() => setShowModal(true)}
          style={styles.deleteButton}
        />
      </View>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>Deseja realmente excluir o registro da refeicao?</Text>
            <View style={styles.row}>
              <Button
                label="Cancelar"
                variant="outline"
                onPress={() => setShowModal(false)}
                style={styles.confirmButton}
              />
              <Button
                label="Sim, excluir"
                onPress={() => {
                  setShowModal(false);
                  onDelete();
                }}
                style={styles.confirmButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MealRow({ meal, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.mealRow}>
      <Text style={styles.mealTime}>{meal.time}</Text>
      <View style={styles.mealDivider} />
      <Text numberOfLines={1} style={styles.mealName}>{meal.name}</Text>
      <View
        style={[
          styles.mealStatus,
          { backgroundColor: meal.inDiet ? COLORS.greenMid : COLORS.redMid },
        ]}
      />
    </Pressable>
  );
}

function Input({ label, style, ...props }) {
  return (
    <View style={[styles.inputWrap, style]}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={COLORS.gray400}
        style={[styles.input, props.multiline && styles.inputMultiline]}
        textAlignVertical={props.multiline ? 'top' : 'center'}
      />
    </View>
  );
}

function DietOption({ label, selected, color, background, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.dietOption,
        selected && { backgroundColor: background, borderColor: color },
      ]}
    >
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={styles.dietOptionText}>{label}</Text>
    </Pressable>
  );
}

function Button({ label, icon, variant = 'solid', style, onPress }) {
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        isOutline && styles.outlineButton,
        style,
      ]}
    >
      {icon && (
        <AppIcon
          name={icon}
          size={18}
          color={isOutline ? COLORS.gray700 : COLORS.white}
          style={styles.buttonIcon}
        />
      )}
      <Text style={[styles.buttonText, isOutline && styles.outlineButtonText]}>{label}</Text>
    </Pressable>
  );
}

function AppIcon({ name, size = 18, color = COLORS.gray700, style }) {
  const icons = {
    'arrow-left': '←',
    'arrow-up-right': '↗',
    plus: '+',
    'edit-3': 'E',
    'trash-2': 'X',
    user: 'U',
  };

  return (
    <Text
      style={[
        styles.appIcon,
        {
          color,
          fontSize: size,
          width: Math.max(size + 6, 24),
          height: Math.max(size + 6, 24),
          lineHeight: Math.max(size + 6, 24),
        },
        style,
      ]}
    >
      {icons[name] || '?'}
    </Text>
  );
}

function ForkKnifeLogo() {
  return (
    <View style={styles.logoMark}>
      <View style={styles.fork}>
        <View style={styles.forkTeeth}>
          <View style={styles.forkTooth} />
          <View style={styles.forkTooth} />
          <View style={styles.forkTooth} />
        </View>
        <View style={styles.forkHandle} />
      </View>
      <View style={styles.knife}>
        <View style={styles.knifeBlade} />
        <View style={styles.knifeHandle} />
      </View>
    </View>
  );
}

function InfoBox({ value, label, style }) {
  return (
    <View style={[styles.infoBox, style]}>
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

function calculateStats(meals) {
  const total = meals.length;
  const inside = meals.filter((meal) => meal.inDiet).length;
  const outside = total - inside;
  const percentage = total === 0 ? 0 : (inside / total) * 100;
  const bestSequence = meals.reduce(
    (acc, meal) => {
      const current = meal.inDiet ? acc.current + 1 : 0;
      return {
        current,
        best: Math.max(acc.best, current),
      };
    },
    { current: 0, best: 0 }
  ).best;

  return { total, inside, outside, percentage, bestSequence };
}

function groupMealsByDate(meals) {
  const grouped = meals.reduce((acc, meal) => {
    if (!acc[meal.date]) acc[meal.date] = [];
    acc[meal.date].push(meal);
    return acc;
  }, {});

  return Object.keys(grouped).map((date) => ({
    date,
    data: grouped[date],
  }));
}

function formatPercentage(value) {
  return `${value.toFixed(2).replace('.', ',')}%`;
}

function headerColor(theme) {
  return theme === 'green' ? COLORS.greenLight : COLORS.redLight;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.gray100,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: COLORS.gray100,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.gray100,
  },
  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 34,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    width: 32,
    height: 32,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 5,
    paddingTop: 2,
  },
  fork: {
    width: 12,
    height: 28,
    alignItems: 'center',
  },
  forkTeeth: {
    height: 11,
    flexDirection: 'row',
    gap: 2,
  },
  forkTooth: {
    width: 2,
    height: 11,
    borderRadius: 1,
    backgroundColor: COLORS.gray700,
  },
  forkHandle: {
    width: 3,
    height: 17,
    borderRadius: 2,
    backgroundColor: COLORS.gray700,
  },
  knife: {
    width: 9,
    height: 28,
    alignItems: 'center',
  },
  knifeBlade: {
    width: 7,
    height: 15,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 1,
    borderBottomLeftRadius: 4,
    backgroundColor: COLORS.gray700,
  },
  knifeHandle: {
    width: 3,
    height: 13,
    borderRadius: 2,
    backgroundColor: COLORS.gray700,
  },
  logoTitle: {
    color: COLORS.gray700,
    fontSize: 16,
    lineHeight: 16,
    fontWeight: '800',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.gray700,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray300,
  },
  percentageCard: {
    minHeight: 112,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    padding: 16,
  },
  percentageArrow: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  percentageValue: {
    fontSize: 32,
    lineHeight: 42,
    fontWeight: '800',
    color: COLORS.gray700,
  },
  percentageLabel: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    color: COLORS.gray700,
    marginBottom: 8,
  },
  button: {
    minHeight: 50,
    borderRadius: 6,
    backgroundColor: COLORS.gray600,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.gray600,
  },
  buttonIcon: {
    marginRight: 8,
  },
  appIcon: {
    textAlign: 'center',
    fontWeight: '900',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  outlineButton: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.gray700,
  },
  outlineButtonText: {
    color: COLORS.gray700,
  },
  mealsList: {
    paddingTop: 32,
    paddingBottom: 120,
  },
  dayGroup: {
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.gray700,
    marginBottom: 8,
  },
  mealRow: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: COLORS.gray100,
  },
  mealTime: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray700,
  },
  mealDivider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.gray300,
    marginHorizontal: 12,
  },
  mealName: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray600,
  },
  mealStatus: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: 12,
  },
  emptyState: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.gray500,
    fontSize: 15,
  },
  statsHero: {
    minHeight: 190,
    paddingTop: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 24,
    top: 24,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsPercentage: {
    fontSize: 32,
    lineHeight: 42,
    fontWeight: '800',
    color: COLORS.gray700,
  },
  statsBody: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  statsTitle: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.gray700,
    marginBottom: 24,
  },
  infoBox: {
    minHeight: 90,
    borderRadius: 8,
    backgroundColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    marginBottom: 12,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.gray700,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 18,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  formHeader: {
    minHeight: 132,
    backgroundColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHeader: {
    minHeight: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.gray700,
  },
  formBody: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  formContent: {
    padding: 24,
    paddingBottom: 120,
  },
  inputWrap: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray600,
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 16,
    color: COLORS.gray700,
    backgroundColor: COLORS.gray100,
  },
  inputMultiline: {
    height: 120,
    paddingTop: 12,
  },
  textArea: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flexInput: {
    flex: 1,
  },
  dietOption: {
    flex: 1,
    height: 54,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.gray200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dietOptionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray700,
  },
  footer: {
    padding: 24,
    backgroundColor: COLORS.gray100,
  },
  feedbackScreen: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  feedbackTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  feedbackText: {
    color: COLORS.gray700,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 42,
  },
  feedbackButton: {
    marginTop: 32,
    minWidth: 210,
  },
  illustration: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationShadow: {
    position: 'absolute',
    bottom: 18,
    width: 150,
    height: 88,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },
  head: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.gray700,
    backgroundColor: COLORS.gray100,
    marginBottom: 6,
  },
  bodyLine: {
    width: 46,
    height: 72,
    borderWidth: 2,
    borderColor: COLORS.gray700,
    borderRadius: 22,
    transform: [{ rotate: '-8deg' }],
  },
  arm: {
    position: 'absolute',
    top: 72,
    width: 60,
    height: 2,
    backgroundColor: COLORS.gray700,
  },
  leftArm: {
    left: 44,
    transform: [{ rotate: '38deg' }],
  },
  rightArm: {
    right: 44,
    transform: [{ rotate: '-38deg' }],
  },
  leg: {
    position: 'absolute',
    bottom: 42,
    width: 76,
    height: 2,
    backgroundColor: COLORS.gray700,
  },
  leftLeg: {
    left: 54,
    transform: [{ rotate: '48deg' }],
  },
  rightLeg: {
    right: 50,
    transform: [{ rotate: '-54deg' }],
  },
  detailBody: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 24,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.gray700,
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 16,
    color: COLORS.gray600,
    lineHeight: 24,
    marginBottom: 28,
  },
  detailSection: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.gray700,
    marginBottom: 8,
  },
  detailDate: {
    fontSize: 16,
    color: COLORS.gray600,
    marginBottom: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: COLORS.gray200,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  badgeText: {
    fontSize: 14,
    color: COLORS.gray700,
  },
  deleteButton: {
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  confirmBox: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 24,
  },
  confirmText: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '800',
    color: COLORS.gray600,
    marginBottom: 28,
  },
  confirmButton: {
    flex: 1,
  },
});

export default App;
