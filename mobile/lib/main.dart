import 'package:flutter/material.dart';

void main() {
  runApp(const PrepKartaApp());
}

const Color _bg = Color(0xFF050505);
const Color _surface = Color(0xFF111315);
const Color _surfaceAlt = Color(0xFF171A1D);
const Color _teal = Color(0xFF10B981);
const Color _mint = Color(0xFF64FFD9);
const Color _slate = Color(0xFF94A3B8);
const Color _heading = Colors.white;
const Color _red = Color(0xFFF87171);
const Color _amber = Color(0xFFFBBF24);

class PrepKartaApp extends StatelessWidget {
  const PrepKartaApp({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: _bg,
      colorScheme: const ColorScheme.dark(
        primary: _teal,
        secondary: _mint,
        surface: _surface,
        error: _red,
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
          color: _heading,
          fontSize: 28,
          fontWeight: FontWeight.w700,
        ),
        titleLarge: TextStyle(
          color: _heading,
          fontSize: 20,
          fontWeight: FontWeight.w700,
        ),
        titleMedium: TextStyle(
          color: _heading,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
        bodyMedium: TextStyle(color: _slate, fontSize: 14, height: 1.45),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: _heading,
        elevation: 0,
        centerTitle: false,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: _surfaceAlt,
        selectedColor: _teal.withValues(alpha: 0.18),
        side: const BorderSide(color: Color(0x22FFFFFF)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        labelStyle: const TextStyle(color: _slate, fontWeight: FontWeight.w600),
      ),
      cardTheme: CardThemeData(
        color: _surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: Color(0x14FFFFFF)),
        ),
      ),
    );

    return MaterialApp(
      title: 'PrepKarta',
      debugShowCheckedModeBanner: false,
      theme: theme,
      home: const PrepKartaShell(),
    );
  }
}

class PrepKartaShell extends StatefulWidget {
  const PrepKartaShell({super.key});

  @override
  State<PrepKartaShell> createState() => _PrepKartaShellState();
}

class _PrepKartaShellState extends State<PrepKartaShell> {
  final List<PrepSubject> _subjects = sampleSubjects;
  int _tabIndex = 0;
  int _selectedSubjectIndex = 0;
  int _questionIndex = 0;
  int? _selectedOptionIndex;
  bool _submitted = false;

  QuizQuestion get _currentQuestion => sampleQuestions[_questionIndex];

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      HomeTab(
        subjects: _subjects,
        selectedSubjectIndex: _selectedSubjectIndex,
        onSelectSubject: (index) =>
            setState(() => _selectedSubjectIndex = index),
        onStartPractice: () => setState(() => _tabIndex = 1),
      ),
      PracticeTab(
        question: _currentQuestion,
        questionIndex: _questionIndex,
        totalQuestions: sampleQuestions.length,
        selectedOptionIndex: _selectedOptionIndex,
        submitted: _submitted,
        onSelectOption: (index) {
          if (_submitted) return;
          setState(() => _selectedOptionIndex = index);
        },
        onSubmit: _submitAnswer,
        onNext: _nextQuestion,
      ),
      const AnalyticsTab(),
      const ProfileTab(),
    ];

    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF07110F), _bg, Color(0xFF081A17)],
          ),
        ),
        child: SafeArea(
          child: IndexedStack(index: _tabIndex, children: pages),
        ),
      ),
      bottomNavigationBar: NavigationBar(
        height: 72,
        backgroundColor: _surface,
        indicatorColor: _teal.withValues(alpha: 0.18),
        selectedIndex: _tabIndex,
        onDestinationSelected: (index) => setState(() => _tabIndex = index),
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Home'),
          NavigationDestination(
            icon: Icon(Icons.bolt_outlined),
            label: 'Practice',
          ),
          NavigationDestination(
            icon: Icon(Icons.insights_outlined),
            label: 'Analytics',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  void _submitAnswer() {
    if (_selectedOptionIndex == null) return;
    setState(() => _submitted = true);
  }

  void _nextQuestion() {
    setState(() {
      _questionIndex = (_questionIndex + 1) % sampleQuestions.length;
      _selectedOptionIndex = null;
      _submitted = false;
    });
  }
}

class HomeTab extends StatelessWidget {
  const HomeTab({
    super.key,
    required this.subjects,
    required this.selectedSubjectIndex,
    required this.onSelectSubject,
    required this.onStartPractice,
  });

  final List<PrepSubject> subjects;
  final int selectedSubjectIndex;
  final ValueChanged<int> onSelectSubject;
  final VoidCallback onStartPractice;

  @override
  Widget build(BuildContext context) {
    final subject = subjects[selectedSubjectIndex];

    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          sliver: SliverList.list(
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'PrepKarta',
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Micro-practice interview engine for daily readiness.',
                        ),
                      ],
                    ),
                  ),
                  const _TealHalo(icon: Icons.psychology_alt_outlined),
                ],
              ),
              const SizedBox(height: 20),
              const _HeroCard(),
              const SizedBox(height: 20),
              const _SectionTitle(
                title: 'Subjects',
                subtitle: 'Pick an area and keep your streak alive.',
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 168,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: subjects.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 12),
                  itemBuilder: (context, index) {
                    final item = subjects[index];
                    final selected = index == selectedSubjectIndex;
                    return _SubjectCard(
                      subject: item,
                      selected: selected,
                      onTap: () => onSelectSubject(index),
                    );
                  },
                ),
              ),
              const SizedBox(height: 20),
              _ContinueCard(subject: subject, onStartPractice: onStartPractice),
              const SizedBox(height: 20),
              const _SectionTitle(
                title: 'Chapter Ladder',
                subtitle:
                    'Follow the same interview-first hierarchy from the web UI.',
              ),
              const SizedBox(height: 12),
              ...subject.chapters.map(
                (chapter) => _ChapterCard(chapter: chapter),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class PracticeTab extends StatelessWidget {
  const PracticeTab({
    super.key,
    required this.question,
    required this.questionIndex,
    required this.totalQuestions,
    required this.selectedOptionIndex,
    required this.submitted,
    required this.onSelectOption,
    required this.onSubmit,
    required this.onNext,
  });

  final QuizQuestion question;
  final int questionIndex;
  final int totalQuestions;
  final int? selectedOptionIndex;
  final bool submitted;
  final ValueChanged<int> onSelectOption;
  final VoidCallback onSubmit;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      children: [
        const _SectionTitle(
          title: 'Practice Sprint',
          subtitle: 'Resume mode with focused, short-answer decision making.',
        ),
        const SizedBox(height: 16),
        _GlassCard(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    '${questionIndex + 1}/$totalQuestions attempted',
                    style: const TextStyle(
                      color: _slate,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Spacer(),
                  _DifficultyPill(level: question.difficulty),
                ],
              ),
              const SizedBox(height: 18),
              Text(
                question.prompt,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 18),
              ...List.generate(question.options.length, (index) {
                final selected = selectedOptionIndex == index;
                final correct = question.correctIndex == index;
                final revealCorrect = submitted && correct;
                final revealWrong = submitted && selected && !correct;

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(20),
                    onTap: () => onSelectOption(index),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: revealCorrect
                              ? _teal
                              : revealWrong
                              ? _red
                              : selected
                              ? _mint
                              : const Color(0x22FFFFFF),
                        ),
                        color: revealCorrect
                            ? _teal.withValues(alpha: 0.15)
                            : revealWrong
                            ? _red.withValues(alpha: 0.12)
                            : selected
                            ? _mint.withValues(alpha: 0.10)
                            : _surfaceAlt,
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              question.options[index],
                              style: const TextStyle(
                                color: _heading,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          if (revealCorrect)
                            const Icon(Icons.check_circle, color: _teal)
                          else if (revealWrong)
                            const Icon(Icons.cancel, color: _red),
                        ],
                      ),
                    ),
                  ),
                );
              }),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: submitted
                      ? onNext
                      : selectedOptionIndex == null
                      ? null
                      : onSubmit,
                  style: FilledButton.styleFrom(
                    backgroundColor: _teal,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                  child: Text(submitted ? 'Next Question' : 'Submit'),
                ),
              ),
              if (submitted) ...[
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0E1715),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0x2234D399)),
                  ),
                  child: Text(question.explanation),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class AnalyticsTab extends StatelessWidget {
  const AnalyticsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      children: const [
        _SectionTitle(
          title: 'Interview Analytics',
          subtitle: 'Strength, weakness, accuracy, and momentum in one place.',
        ),
        SizedBox(height: 16),
        _MetricGrid(),
        SizedBox(height: 16),
        _InsightCard(
          title: 'Strongest Concepts',
          chips: ['Sliding Window', 'HTTP Caching', 'Factory Pattern'],
          accent: _teal,
        ),
        SizedBox(height: 16),
        _InsightCard(
          title: 'Weakest Concepts',
          chips: ['Rate Limiting', 'DP on Trees', 'CAP Tradeoffs'],
          accent: _red,
        ),
      ],
    );
  }
}

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      children: [
        const _SectionTitle(
          title: 'Profile',
          subtitle: 'Focus on readiness, schedule, and daily consistency.',
        ),
        const SizedBox(height: 16),
        _GlassCard(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: Color(0xFF0F2B24),
                    child: Icon(Icons.person, color: _mint),
                  ),
                  SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Rajesh Kumar',
                          style: TextStyle(
                            color: _heading,
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text('Targeting SDE-2 interviews in 6 weeks'),
                      ],
                    ),
                  ),
                ],
              ),
              SizedBox(height: 20),
              _ProfileRow(label: 'Daily goal', value: '25 questions'),
              _ProfileRow(label: 'Preferred mode', value: 'Resume practice'),
              _ProfileRow(label: 'Next review block', value: 'Today, 8:30 PM'),
              _ProfileRow(label: 'Current streak', value: '17 days'),
            ],
          ),
        ),
        const SizedBox(height: 16),
        _GlassCard(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text(
                'Recent activity',
                style: TextStyle(
                  color: _heading,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(height: 14),
              _ActivityTile(
                title: 'Completed Graph BFS sprint',
                subtitle: '12 questions solved with 83% accuracy',
                icon: Icons.hub_outlined,
              ),
              _ActivityTile(
                title: 'Reviewed System Design notes',
                subtitle: 'Caching and read-heavy scaling patterns',
                icon: Icons.layers_outlined,
              ),
              _ActivityTile(
                title: 'Weak-area reminder',
                subtitle: 'Retry backoff and idempotency queued for tonight',
                icon: Icons.notifications_none,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard();

  @override
  Widget build(BuildContext context) {
    return _GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              _TealHalo(icon: Icons.local_fire_department_outlined, size: 22),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  '17 day streak',
                  style: TextStyle(
                    color: _heading,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Text(
                'Readiness 82',
                style: TextStyle(color: _mint, fontWeight: FontWeight.w700),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text(
            'Keep the daily loop small: 10 minutes of subject review, 10 minutes of practice, 5 minutes of correction.',
          ),
          const SizedBox(height: 18),
          const Row(
            children: [
              Expanded(
                child: _MiniStat(label: 'Solved', value: '148'),
              ),
              SizedBox(width: 12),
              Expanded(
                child: _MiniStat(label: 'Accuracy', value: '78%'),
              ),
              SizedBox(width: 12),
              Expanded(
                child: _MiniStat(label: 'Weak areas', value: '06'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ContinueCard extends StatelessWidget {
  const _ContinueCard({required this.subject, required this.onStartPractice});

  final PrepSubject subject;
  final VoidCallback onStartPractice;

  @override
  Widget build(BuildContext context) {
    return _GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Continue Practice',
            style: TextStyle(
              color: _heading,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${subject.name} • ${subject.nextTopic}',
            style: const TextStyle(color: _mint, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 10),
          Text(
            '${(subject.progress * 100).round()}% mastery • ${subject.attempts} attempts',
          ),
          const SizedBox(height: 16),
          LinearProgressIndicator(
            value: subject.progress,
            minHeight: 10,
            borderRadius: BorderRadius.circular(999),
            backgroundColor: Colors.white12,
            color: _teal,
          ),
          const SizedBox(height: 16),
          OutlinedButton(
            onPressed: onStartPractice,
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0x6634D399)),
              foregroundColor: _mint,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18),
              ),
            ),
            child: const Text('Open Resume Mode'),
          ),
        ],
      ),
    );
  }
}

class _ChapterCard extends StatelessWidget {
  const _ChapterCard({required this.chapter});

  final PrepChapter chapter;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: _GlassCard(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    chapter.name,
                    style: const TextStyle(
                      color: _heading,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                Text(
                  '${chapter.totalQuestions} Qs',
                  style: const TextStyle(
                    color: _slate,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: chapter.subchapters
                  .map(
                    (name) => Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: _surfaceAlt,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: const Color(0x1FFFFFFF)),
                      ),
                      child: Text(
                        name,
                        style: const TextStyle(
                          color: _slate,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricGrid extends StatelessWidget {
  const _MetricGrid();

  @override
  Widget build(BuildContext context) {
    const metrics = [
      ('Accuracy', '78%'),
      ('Solved', '148'),
      ('Readiness', '82'),
      ('Streak', '17d'),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: metrics.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 1.35,
      ),
      itemBuilder: (context, index) {
        final metric = metrics[index];
        return _GlassCard(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                metric.$1,
                style: const TextStyle(
                  color: _slate,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                metric.$2,
                style: const TextStyle(
                  color: _heading,
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _InsightCard extends StatelessWidget {
  const _InsightCard({
    required this.title,
    required this.chips,
    required this.accent,
  });

  final String title;
  final List<String> chips;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return _GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: _heading,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: chips
                .map(
                  (chip) => Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: accent.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: accent.withValues(alpha: 0.35)),
                    ),
                    child: Text(
                      chip,
                      style: TextStyle(
                        color: accent,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}

class _GlassCard extends StatelessWidget {
  const _GlassCard({required this.child, required this.padding});

  final Widget child;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0x18FFFFFF)),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [_surface, _surfaceAlt],
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x2400FFCC),
            blurRadius: 24,
            offset: Offset(0, 12),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _TealHalo extends StatelessWidget {
  const _TealHalo({required this.icon, this.size = 28});

  final IconData icon;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size + 18,
      height: size + 18,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            _teal.withValues(alpha: 0.30),
            _teal.withValues(alpha: 0.08),
          ],
        ),
        border: Border.all(color: const Color(0x4434D399)),
      ),
      child: Icon(icon, color: _mint, size: size),
    );
  }
}

class _MiniStat extends StatelessWidget {
  const _MiniStat({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _surfaceAlt,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: _slate,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              color: _heading,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: _heading,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 4),
        Text(subtitle),
      ],
    );
  }
}

class _SubjectCard extends StatelessWidget {
  const _SubjectCard({
    required this.subject,
    required this.selected,
    required this.onTap,
  });

  final PrepSubject subject;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        width: 240,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: selected
                ? const [Color(0xFF10332C), Color(0xFF0B1F1A)]
                : const [_surface, _surfaceAlt],
          ),
          border: Border.all(
            color: selected ? const Color(0x9934D399) : const Color(0x18FFFFFF),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(subject.icon, color: selected ? _mint : _slate),
                const Spacer(),
                Text(
                  '${(subject.progress * 100).round()}%',
                  style: TextStyle(
                    color: selected ? _mint : _slate,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            const Spacer(),
            Text(
              subject.name,
              style: const TextStyle(
                color: _heading,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '${subject.attempts} attempts • ${subject.nextTopic}',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

class _DifficultyPill extends StatelessWidget {
  const _DifficultyPill({required this.level});

  final String level;

  @override
  Widget build(BuildContext context) {
    final color = switch (level) {
      'hard' => _red,
      'medium' => _amber,
      _ => _teal,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        level.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}

class _ProfileRow extends StatelessWidget {
  const _ProfileRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                color: _slate,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              color: _heading,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActivityTile extends StatelessWidget {
  const _ActivityTile({
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  final String title;
  final String subtitle;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: _surfaceAlt,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: _mint, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: _heading,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(subtitle),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class PrepSubject {
  const PrepSubject({
    required this.name,
    required this.icon,
    required this.progress,
    required this.attempts,
    required this.nextTopic,
    required this.chapters,
  });

  final String name;
  final IconData icon;
  final double progress;
  final int attempts;
  final String nextTopic;
  final List<PrepChapter> chapters;
}

class PrepChapter {
  const PrepChapter({
    required this.name,
    required this.totalQuestions,
    required this.subchapters,
  });

  final String name;
  final int totalQuestions;
  final List<String> subchapters;
}

class QuizQuestion {
  const QuizQuestion({
    required this.prompt,
    required this.options,
    required this.correctIndex,
    required this.difficulty,
    required this.explanation,
  });

  final String prompt;
  final List<String> options;
  final int correctIndex;
  final String difficulty;
  final String explanation;
}

const sampleSubjects = [
  PrepSubject(
    name: 'DSA',
    icon: Icons.account_tree_outlined,
    progress: 0.76,
    attempts: 84,
    nextTopic: 'Graphs: shortest path',
    chapters: [
      PrepChapter(
        name: 'Arrays and Strings',
        totalQuestions: 42,
        subchapters: ['Sliding Window', 'Prefix Sum', 'Two Pointers'],
      ),
      PrepChapter(
        name: 'Graphs',
        totalQuestions: 31,
        subchapters: ['BFS', 'DFS', 'Dijkstra'],
      ),
    ],
  ),
  PrepSubject(
    name: 'System Design',
    icon: Icons.layers_outlined,
    progress: 0.63,
    attempts: 37,
    nextTopic: 'Caching for read-heavy systems',
    chapters: [
      PrepChapter(
        name: 'Scalability',
        totalQuestions: 22,
        subchapters: ['Load Balancing', 'Caching', 'Sharding'],
      ),
      PrepChapter(
        name: 'Reliability',
        totalQuestions: 18,
        subchapters: ['Retries', 'Idempotency', 'Backpressure'],
      ),
    ],
  ),
  PrepSubject(
    name: 'Low Level Design',
    icon: Icons.architecture_outlined,
    progress: 0.58,
    attempts: 29,
    nextTopic: 'Strategy vs factory tradeoffs',
    chapters: [
      PrepChapter(
        name: 'Object Modeling',
        totalQuestions: 16,
        subchapters: ['SOLID', 'Composition', 'Encapsulation'],
      ),
      PrepChapter(
        name: 'Patterns',
        totalQuestions: 20,
        subchapters: ['Factory', 'Strategy', 'Observer'],
      ),
    ],
  ),
];

const sampleQuestions = [
  QuizQuestion(
    prompt:
        'Which strategy best reduces repeated database reads for a read-heavy product detail API?',
    options: [
      'Add synchronous retries to every DB call',
      'Introduce a cache with invalidation on writes',
      'Increase request timeout to 30 seconds',
      'Move all reads to the primary database',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    explanation:
        'A cache cuts repeated reads while write-triggered invalidation limits stale data windows.',
  ),
  QuizQuestion(
    prompt:
        'For shortest path in an unweighted graph, which traversal is optimal?',
    options: [
      'Depth-first search',
      'Binary search',
      'Breadth-first search',
      'Topological sort',
    ],
    correctIndex: 2,
    difficulty: 'easy',
    explanation:
        'BFS explores level by level, which gives the shortest path in edge count for unweighted graphs.',
  ),
  QuizQuestion(
    prompt:
        'Which pattern is the best fit when behavior must be switched at runtime without changing the caller?',
    options: ['Strategy', 'Singleton', 'Builder', 'Prototype'],
    correctIndex: 0,
    difficulty: 'hard',
    explanation:
        'Strategy encapsulates interchangeable behavior behind the same interface, so the caller stays unchanged.',
  ),
];
