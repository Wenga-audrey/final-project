import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Create super admin user
  const superAdminPassword = await bcrypt.hash("superadmin123", 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@mindboost.com" },
    update: {
      password: superAdminPassword,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPER_ADMIN",
      isEmailVerified: true,
    },
    create: {
      email: "superadmin@mindboost.com",
      password: superAdminPassword,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPER_ADMIN",
      isEmailVerified: true,
    },
  });

  // Create prep admin user
  const prepAdminPassword = await bcrypt.hash("prepadmin123", 12);
  const prepAdmin = await prisma.user.upsert({
    where: { email: "prepadmin@mindboost.com" },
    update: {
      password: prepAdminPassword,
      firstName: "Prep",
      lastName: "Admin",
      role: "PREP_ADMIN",
      isEmailVerified: true,
    },
    create: {
      email: "prepadmin@mindboost.com",
      password: prepAdminPassword,
      firstName: "Prep",
      lastName: "Admin",
      role: "PREP_ADMIN",
      isEmailVerified: true,
    },
  });

  // Create teacher user
  const teacherPassword = await bcrypt.hash("teacher123", 12);
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@mindboost.com" },
    update: {
      password: teacherPassword,
      firstName: "Jean",
      lastName: "Professeur",
      role: "TEACHER",
      isEmailVerified: true,
    },
    create: {
      email: "teacher@mindboost.com",
      password: teacherPassword,
      firstName: "Jean",
      lastName: "Professeur",
      role: "TEACHER",
      isEmailVerified: true,
    },
  });

  // Create demo learner users
  const learner1Password = await bcrypt.hash("learner123", 12);
  const learner1 = await prisma.user.upsert({
    where: { email: "learner@mindboost.com" },
    update: {
      password: learner1Password,
      firstName: "Marie",
      lastName: "Étudiante",
      role: "LEARNER",
      isEmailVerified: true,
    },
    create: {
      email: "learner@mindboost.com",
      password: learner1Password,
      firstName: "Marie",
      lastName: "Étudiante",
      role: "LEARNER",
      isEmailVerified: true,
    },
  });

  const learner2Password = await bcrypt.hash("student123", 12);
  const learner2 = await prisma.user.upsert({
    where: { email: "student@mindboost.com" },
    update: {
      password: learner2Password,
      firstName: "Paul",
      lastName: "Étudiant",
      role: "LEARNER",
      isEmailVerified: true,
    },
    create: {
      email: "student@mindboost.com",
      password: learner2Password,
      firstName: "Paul",
      lastName: "Étudiant",
      role: "LEARNER",
      isEmailVerified: true,
    },
  });

  // Create comprehensive preparatory classes for all major Cameroon concours
  const enamClass = await prisma.preparatoryClass.upsert({
    where: { id: "enam-cycle-a-2024" },
    update: {},
    create: {
      id: "enam-cycle-a-2024",
      name: "ENAM - Cycle A (Administration Générale)",
      description: "Préparation complète au concours d'entrée à l'École Nationale d'Administration et de Magistrature - Cycle A",
      examType: "ENAM",
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
      price: 85000,
      isActive: true,
    },
  });

  const emiaClass = await prisma.preparatoryClass.upsert({
    where: { id: "emia-officier-2024" },
    update: {},
    create: {
      id: "emia-officier-2024",
      name: "EMIA - École Militaire Interarmées",
      description: "Préparation au concours d'entrée à l'École Militaire Interarmées du Cameroun",
      examType: "EMIA",
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-07-31'),
      price: 95000,
      isActive: true,
    },
  });

  const ensLettresClass = await prisma.preparatoryClass.upsert({
    where: { id: "ens-lettres-2024" },
    update: {},
    create: {
      id: "ens-lettres-2024",
      name: "ENS - Lettres Modernes Françaises",
      description: "Préparation au concours d'entrée à l'École Normale Supérieure - Département de Lettres Modernes Françaises",
      examType: "ENS",
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-07-15'),
      price: 75000,
      isActive: true,
    },
  });

  const ensSciencesClass = await prisma.preparatoryClass.upsert({
    where: { id: "ens-sciences-2024" },
    update: {},
    create: {
      id: "ens-sciences-2024",
      name: "ENS - Sciences Exactes",
      description: "Préparation au concours d'entrée à l'École Normale Supérieure - Département de Sciences Exactes",
      examType: "ENS",
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-07-15'),
      price: 80000,
      isActive: true,
    },
  });

  const ensetClass = await prisma.preparatoryClass.upsert({
    where: { id: "enset-technique-2024" },
    update: {},
    create: {
      id: "enset-technique-2024",
      name: "ENSET - Sciences et Techniques",
      description: "Préparation au concours d'entrée à l'École Normale Supérieure de l'Enseignement Technique",
      examType: "ENSET",
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-08-15'),
      price: 70000,
      isActive: true,
    },
  });

  const iricClass = await prisma.preparatoryClass.upsert({
    where: { id: "iric-diplomatie-2024" },
    update: {},
    create: {
      id: "iric-diplomatie-2024",
      name: "IRIC - Relations Internationales et Diplomatie",
      description: "Préparation au concours d'entrée à l'Institut des Relations Internationales du Cameroun",
      examType: "IRIC",
      startDate: new Date('2024-01-20'),
      endDate: new Date('2024-06-30'),
      price: 90000,
      isActive: true,
    },
  });

  const paramedicalClass = await prisma.preparatoryClass.upsert({
    where: { id: "paramedical-ide-2024" },
    update: {},
    create: {
      id: "paramedical-ide-2024",
      name: "Concours Paramédicaux - Infirmiers d'État",
      description: "Préparation aux concours paramédicaux - Infirmiers d'État, Sages-femmes, Techniciens médicaux",
      examType: "PARAMEDICAL",
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-08-30'),
      price: 55000,
      isActive: true,
    },
  });

  const engineeringClass = await prisma.preparatoryClass.upsert({
    where: { id: "ingenieurs-polytech-2024" },
    update: {},
    create: {
      id: "ingenieurs-polytech-2024",
      name: "Écoles d'Ingénieurs - Polytech Cameroun",
      description: "Préparation aux concours d'entrée aux écoles d'ingénieurs (Polytech, EGEM, etc.)",
      examType: "ENGINEERING",
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-07-30'),
      price: 95000,
      isActive: true,
    },
  });

  const fonctionPubliqueClass = await prisma.preparatoryClass.upsert({
    where: { id: "fonction-publique-admin-2024" },
    update: {},
    create: {
      id: "fonction-publique-admin-2024",
      name: "Concours Fonction Publique - Administration",
      description: "Préparation aux concours de la Fonction Publique Camerounaise",
      examType: "FONCTION_PUBLIQUE",
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-09-30'),
      price: 60000,
      isActive: true,
    },
  });

  const policeClass = await prisma.preparatoryClass.upsert({
    where: { id: "police-officier-2024" },
    update: {},
    create: {
      id: "police-officier-2024",
      name: "Concours Police Nationale - Officier de Police",
      description: "Préparation au concours de recrutement d'Officiers de Police de la Sûreté Nationale",
      examType: "POLICE",
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-05-31'),
      price: 45000,
      isActive: true,
    },
  });

  const douanesClass = await prisma.preparatoryClass.upsert({
    where: { id: "douanes-inspecteur-2024" },
    update: {},
    create: {
      id: "douanes-inspecteur-2024",
      name: "Concours Douanes - Inspecteur des Douanes",
      description: "Préparation au concours de recrutement d'Inspecteurs des Douanes du Cameroun",
      examType: "CUSTOMS",
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-08-31'),
      price: 65000,
      isActive: true,
    },
  });

  // Create comprehensive subjects for each exam type according to Cameroon concours structure

  // ENAM Subjects
  const enamCultureSubject = await prisma.subject.upsert({
    where: { id: "enam-culture-generale" },
    update: {},
    create: {
      id: "enam-culture-generale",
      classId: enamClass.id,
      name: "Culture générale",
      description: "Histoire, géographie, institutions camerounaises, actualités internationales",
      order: 1,
    },
  });

  const enamDroitPublicSubject = await prisma.subject.upsert({
    where: { id: "enam-droit-public" },
    update: {},
    create: {
      id: "enam-droit-public",
      classId: enamClass.id,
      name: "Droit public",
      description: "Droit constitutionnel, administratif, institutions publiques",
      order: 2,
    },
  });

  const enamLangueSubject = await prisma.subject.upsert({
    where: { id: "enam-langue" },
    update: {},
    create: {
      id: "enam-langue",
      classId: enamClass.id,
      name: "Langue (Français ou Anglais)",
      description: "Maîtrise linguistique, expression écrite et orale",
      order: 3,
    },
  });

  const enamEconomieSubject = await prisma.subject.upsert({
    where: { id: "enam-economie" },
    update: {},
    create: {
      id: "enam-economie",
      classId: enamClass.id,
      name: "Économie",
      description: "Économie générale, économie du développement, politique économique",
      order: 4,
    },
  });

  const enamOrganisationJudiciaireSubject = await prisma.subject.upsert({
    where: { id: "enam-organisation-judiciaire" },
    update: {},
    create: {
      id: "enam-organisation-judiciaire",
      classId: enamClass.id,
      name: "Organisation judiciaire et procédure pénale",
      description: "Système judiciaire camerounais, procédure pénale",
      order: 5,
    },
  });

  const enamFinancesPubliquesSubject = await prisma.subject.upsert({
    where: { id: "enam-finances-publiques" },
    update: {},
    create: {
      id: "enam-finances-publiques",
      classId: enamClass.id,
      name: "Finances publiques",
      description: "Budget de l'État, fiscalité, comptabilité publique",
      order: 6,
    },
  });

  // EMIA Subjects
  const emiaMathSubject = await prisma.subject.upsert({
    where: { id: "emia-mathematiques" },
    update: {},
    create: {
      id: "emia-mathematiques",
      classId: emiaClass.id,
      name: "Mathématiques",
      description: "Mathématiques générales pour concours militaire",
      order: 1,
    },
  });

  const emiaPhysiqueSubject = await prisma.subject.upsert({
    where: { id: "emia-physique" },
    update: {},
    create: {
      id: "emia-physique",
      classId: emiaClass.id,
      name: "Physique",
      description: "Physique générale et appliquée",
      order: 2,
    },
  });

  const emiaChimieSubject = await prisma.subject.upsert({
    where: { id: "emia-chimie" },
    update: {},
    create: {
      id: "emia-chimie",
      classId: emiaClass.id,
      name: "Chimie",
      description: "Chimie générale et organique",
      order: 3,
    },
  });

  const emiaAnglaisSubject = await prisma.subject.upsert({
    where: { id: "emia-anglais" },
    update: {},
    create: {
      id: "emia-anglais",
      classId: emiaClass.id,
      name: "Langue (Anglais)",
      description: "Maîtrise de l'anglais technique et général",
      order: 4,
    },
  });

  const emiaCultureGeneraleSubject = await prisma.subject.upsert({
    where: { id: "emia-culture-generale" },
    update: {},
    create: {
      id: "emia-culture-generale",
      classId: emiaClass.id,
      name: "Culture générale",
      description: "Culture générale et actualités",
      order: 5,
    },
  });

  // ENS Lettres Subjects
  const ensLettresFrancaisSubject = await prisma.subject.upsert({
    where: { id: "ens-lettres-francais" },
    update: {},
    create: {
      id: "ens-lettres-francais",
      classId: ensLettresClass.id,
      name: "Français",
      description: "Littérature, grammaire, expression écrite",
      order: 1,
    },
  });

  const ensLettresHistoireSubject = await prisma.subject.upsert({
    where: { id: "ens-lettres-histoire" },
    update: {},
    create: {
      id: "ens-lettres-histoire",
      classId: ensLettresClass.id,
      name: "Histoire",
      description: "Histoire générale et histoire du Cameroun",
      order: 2,
    },
  });

  const ensLettresGeographieSubject = await prisma.subject.upsert({
    where: { id: "ens-lettres-geographie" },
    update: {},
    create: {
      id: "ens-lettres-geographie",
      classId: ensLettresClass.id,
      name: "Géographie",
      description: "Géographie générale et géographie du Cameroun",
      order: 3,
    },
  });

  const ensLettresPhilosophieSubject = await prisma.subject.upsert({
    where: { id: "ens-lettres-philosophie" },
    update: {},
    create: {
      id: "ens-lettres-philosophie",
      classId: ensLettresClass.id,
      name: "Philosophie",
      description: "Introduction à la philosophie, pensée critique",
      order: 4,
    },
  });

  // ENS Sciences Subjects
  const ensSciencesMathSubject = await prisma.subject.upsert({
    where: { id: "ens-sciences-math" },
    update: {},
    create: {
      id: "ens-sciences-math",
      classId: ensSciencesClass.id,
      name: "Mathématiques",
      description: "Algèbre, analyse, géométrie",
      order: 1,
    },
  });

  const ensSciencesPhysiqueSubject = await prisma.subject.upsert({
    where: { id: "ens-sciences-physique" },
    update: {},
    create: {
      id: "ens-sciences-physique",
      classId: ensSciencesClass.id,
      name: "Physique",
      description: "Mécanique, thermodynamique, électromagnétisme",
      order: 2,
    },
  });

  const ensSciencesChimieSubject = await prisma.subject.upsert({
    where: { id: "ens-sciences-chimie" },
    update: {},
    create: {
      id: "ens-sciences-chimie",
      classId: ensSciencesClass.id,
      name: "Chimie",
      description: "Chimie générale, chimie organique, chimie minérale",
      order: 3,
    },
  });

  const ensSciencesBiologieSubject = await prisma.subject.upsert({
    where: { id: "ens-sciences-biologie" },
    update: {},
    create: {
      id: "ens-sciences-biologie",
      classId: ensSciencesClass.id,
      name: "Biologie",
      description: "Biologie cellulaire, génétique, écologie",
      order: 4,
    },
  });

  // Paramedical Subjects
  const paramedicalCultureSubject = await prisma.subject.upsert({
    where: { id: "paramedical-culture-generale" },
    update: {},
    create: {
      id: "paramedical-culture-generale",
      classId: paramedicalClass.id,
      name: "Culture générale",
      description: "Culture générale médicale et actualités",
      order: 1,
    },
  });

  const paramedicalBiologieSubject = await prisma.subject.upsert({
    where: { id: "paramedical-biologie" },
    update: {},
    create: {
      id: "paramedical-biologie",
      classId: paramedicalClass.id,
      name: "Biologie",
      description: "Biologie cellulaire, physiologie, microbiologie",
      order: 2,
    },
  });

  const paramedicalChimieSubject = await prisma.subject.upsert({
    where: { id: "paramedical-chimie" },
    update: {},
    create: {
      id: "paramedical-chimie",
      classId: paramedicalClass.id,
      name: "Chimie",
      description: "Chimie générale et chimie biologique",
      order: 3,
    },
  });

  const paramedicalPhysiqueSubject = await prisma.subject.upsert({
    where: { id: "paramedical-physique" },
    update: {},
    create: {
      id: "paramedical-physique",
      classId: paramedicalClass.id,
      name: "Physique",
      description: "Physique médicale et radioprotection",
      order: 4,
    },
  });

  const paramedicalMathematiquesSubject = await prisma.subject.upsert({
    where: { id: "paramedical-mathematiques" },
    update: {},
    create: {
      id: "paramedical-mathematiques",
      classId: paramedicalClass.id,
      name: "Mathématiques",
      description: "Statistiques médicales et calculs",
      order: 5,
    },
  });

  const paramedicalLangueSubject = await prisma.subject.upsert({
    where: { id: "paramedical-langue" },
    update: {},
    create: {
      id: "paramedical-langue",
      classId: paramedicalClass.id,
      name: "Langue (Français ou Anglais)",
      description: "Maîtrise linguistique médicale",
      order: 6,
    },
  });

  // Assign teachers to specific subjects
  console.log("Assigning teachers to subjects...");

  // Assign teacher to ENAM Culture Générale
  await prisma.classTeacher.upsert({
    where: {
      classId_teacherId_subjectId: {
        classId: enamClass.id,
        teacherId: teacher.id,
        subjectId: enamCultureSubject.id,
      },
    },
    update: {},
    create: {
      classId: enamClass.id,
      teacherId: teacher.id,
      subjectId: enamCultureSubject.id,
    },
  });

  // Assign teacher to ENS Lettres Français
  await prisma.classTeacher.upsert({
    where: {
      classId_teacherId_subjectId: {
        classId: ensLettresClass.id,
        teacherId: teacher.id,
        subjectId: ensLettresFrancaisSubject.id,
      },
    },
    update: {},
    create: {
      classId: ensLettresClass.id,
      teacherId: teacher.id,
      subjectId: ensLettresFrancaisSubject.id,
    },
  });

  console.log("Creating sample chapters and lessons for assigned subjects...");

  // Create sample chapters and lessons for ENAM Culture Générale
  const cultureGChapter1 = await prisma.chapter.upsert({
    where: { id: "enam-culture-chap1" },
    update: {},
    create: {
      id: "enam-culture-chap1",
      subjectId: enamCultureSubject.id,
      title: "Histoire du Cameroun",
      description: "Évolution historique du Cameroun depuis les origines jusqu'à nos jours",
      order: 1,
      duration: 120,
    },
  });

  const cultureGLesson1 = await prisma.lesson.upsert({
    where: { id: "enam-culture-lesson1" },
    update: {},
    create: {
      id: "enam-culture-lesson1",
      chapterId: cultureGChapter1.id,
      title: "Période précoloniale",
      content: "Contenu détaillé sur la période précoloniale du Cameroun...",
      order: 1,
      duration: 45,
    },
  });

  const cultureGLesson2 = await prisma.lesson.upsert({
    where: { id: "enam-culture-lesson2" },
    update: {},
    create: {
      id: "enam-culture-lesson2",
      chapterId: cultureGChapter1.id,
      title: "Période coloniale",
      content: "Contenu détaillé sur la période coloniale du Cameroun...",
      order: 2,
      duration: 45,
    },
  });

  // Create sample chapters and lessons for ENS Lettres Français
  const francaisChapter1 = await prisma.chapter.upsert({
    where: { id: "ens-lettres-francais-chap1" },
    update: {},
    create: {
      id: "ens-lettres-francais-chap1",
      subjectId: ensLettresFrancaisSubject.id,
      title: "Littérature française",
      description: "Grands courants de la littérature française",
      order: 1,
      duration: 120,
    },
  });

  const francaisLesson1 = await prisma.lesson.upsert({
    where: { id: "ens-lettres-francais-lesson1" },
    update: {},
    create: {
      id: "ens-lettres-francais-lesson1",
      chapterId: francaisChapter1.id,
      title: "Classicisme",
      content: "Contenu détaillé sur le classicisme en littérature...",
      order: 1,
      duration: 45,
    },
  });

  // Create comprehensive chapters and lessons with real educational content

  // ENAM - Culture générale chapters
  const enamHistoireChapter = await prisma.chapter.upsert({
    where: { id: "enam-histoire-cameroun" },
    update: {},
    create: {
      id: "enam-histoire-cameroun",
      subjectId: enamCultureSubject.id,
      title: "Histoire du Cameroun",
      description: "Évolution historique du Cameroun depuis les origines jusqu'à nos jours",
      order: 1,
      isPublished: true,
    },
  });

  const enamGeographieChapter = await prisma.chapter.upsert({
    where: { id: "enam-geographie-cameroun" },
    update: {},
    create: {
      id: "enam-geographie-cameroun",
      subjectId: enamCultureSubject.id,
      title: "Géographie du Cameroun",
      description: "Aspects physiques, humains et économiques du territoire camerounais",
      order: 2,
      isPublished: true,
    },
  });

  const enamInstitutionsChapter = await prisma.chapter.upsert({
    where: { id: "enam-institutions-politiques" },
    update: {},
    create: {
      id: "enam-institutions-politiques",
      subjectId: enamCultureSubject.id,
      title: "Institutions politiques du Cameroun",
      description: "Structure et fonctionnement des institutions de la République du Cameroun",
      order: 3,
      isPublished: true,
    },
  });

  const enamActualitesChapter = await prisma.chapter.upsert({
    where: { id: "enam-actualites-internationales" },
    update: {},
    create: {
      id: "enam-actualites-internationales",
      subjectId: enamCultureSubject.id,
      title: "Actualités internationales",
      description: "Événements majeurs de la scène internationale contemporaine",
      order: 4,
      isPublished: true,
    },
  });

  // ENAM - Droit public chapters
  const enamDroitConstitutionnelChapter = await prisma.chapter.upsert({
    where: { id: "enam-droit-constitutionnel" },
    update: {},
    create: {
      id: "enam-droit-constitutionnel",
      subjectId: enamDroitPublicSubject.id,
      title: "Droit constitutionnel",
      description: "Principes fondamentaux du droit constitutionnel français et camerounais",
      order: 1,
      isPublished: true,
    },
  });

  const enamDroitAdministratifChapter = await prisma.chapter.upsert({
    where: { id: "enam-droit-administratif" },
    update: {},
    create: {
      id: "enam-droit-administratif",
      subjectId: enamDroitPublicSubject.id,
      title: "Droit administratif",
      description: "Sources, principes et institutions du droit administratif",
      order: 2,
      isPublished: true,
    },
  });

  // ENS Lettres - Littérature Française chapters
  const ensRomantismeChapter = await prisma.chapter.upsert({
    where: { id: "ens-romantisme-francais" },
    update: {},
    create: {
      id: "ens-romantisme-francais",
      subjectId: ensLitteratureSubject.id,
      title: "Le romantisme en littérature",
      description: "Mouvement littéraire du XIXe siècle et ses principaux représentants",
      order: 1,
      isPublished: true,
    },
  });

  const ensParnasseChapter = await prisma.chapter.upsert({
    where: { id: "ens-parnasse-symbolisme" },
    update: {},
    create: {
      id: "ens-parnasse-symbolisme",
      subjectId: ensLitteratureSubject.id,
      title: "Le Parnasse et le Symbolisme",
      description: "Écoles poétiques de la fin du XIXe siècle",
      order: 2,
      isPublished: true,
    },
  });

  const ensRealismeChapter = await prisma.chapter.upsert({
    where: { id: "ens-realisme-naturalisme" },
    update: {},
    create: {
      id: "ens-realisme-naturalisme",
      subjectId: ensLitteratureSubject.id,
      title: "Le Réalisme et le Naturalisme",
      description: "Mouvements littéraires du XIXe siècle axés sur la représentation de la réalité",
      order: 3,
      isPublished: true,
    },
  });

  const ensTheatreClassiqueChapter = await prisma.chapter.upsert({
    where: { id: "ens-theatre-classique" },
    update: {},
    create: {
      id: "ens-theatre-classique",
      subjectId: ensLitteratureSubject.id,
      title: "Le Théâtre classique français",
      description: "Tragédie et comédie du XVIIe siècle",
      order: 4,
      isPublished: true,
    },
  });

  // ENS Sciences - Mathématiques chapters
  const ensAlgebreChapter = await prisma.chapter.upsert({
    where: { id: "ens-algebre-lineaire" },
    update: {},
    create: {
      id: "ens-algebre-lineaire",
      subjectId: ensMathSubject.id,
      title: "Algèbre linéaire",
      description: "Espaces vectoriels, matrices, déterminants",
      order: 1,
      isPublished: true,
    },
  });

  const ensAnalyseChapter = await prisma.chapter.upsert({
    where: { id: "ens-analyse-mathematique" },
    update: {},
    create: {
      id: "ens-analyse-mathematique",
      subjectId: ensMathSubject.id,
      title: "Analyse mathématique",
      description: "Suites, fonctions, dérivées, intégrales",
      order: 2,
      isPublished: true,
    },
  });

  // ENS Sciences - Physique chapters
  const ensMecaniqueChapter = await prisma.chapter.upsert({
    where: { id: "ens-mecanique-classique" },
    update: {},
    create: {
      id: "ens-mecanique-classique",
      subjectId: ensPhysiqueSubject.id,
      title: "Mécanique classique",
      description: "Cinématique, dynamique, lois de Newton",
      order: 1,
      isPublished: true,
    },
  });

  const ensElectromagnetismeChapter = await prisma.chapter.upsert({
    where: { id: "ens-electromagnetisme" },
    update: {},
    create: {
      id: "ens-electromagnetisme",
      subjectId: ensPhysiqueSubject.id,
      title: "Électromagnétisme",
      description: "Électrostatique, magnétostatique, induction",
      order: 2,
      isPublished: true,
    },
  });

  // ENS Sciences - Chimie chapters
  const ensChimieGeneraleChapter = await prisma.chapter.upsert({
    where: { id: "ens-chimie-generale" },
    update: {},
    create: {
      id: "ens-chimie-generale",
      subjectId: ensChimieSubject.id,
      title: "Chimie générale",
      description: "Structure atomique, liaisons chimiques, thermochimie",
      order: 1,
      isPublished: true,
    },
  });

  const ensChimieOrganiqueChapter = await prisma.chapter.upsert({
    where: { id: "ens-chimie-organique" },
    update: {},
    create: {
      id: "ens-chimie-organique",
      subjectId: ensChimieSubject.id,
      title: "Chimie organique",
      description: "Composés du carbone, réactions organiques",
      order: 2,
      isPublished: true,
    },
  });

  // EMIA - Mathématiques chapters
  const emiaAlgebreChapter = await prisma.chapter.upsert({
    where: { id: "emia-algebre-equations" },
    update: {},
    create: {
      id: "emia-algebre-equations",
      subjectId: emiaMathSubject.id,
      title: "Algèbre et Équations",
      description: "Résolution d'équations, systèmes linéaires, polynômes",
      order: 1,
      isPublished: true,
    },
  });

  const emiaGeometrieChapter = await prisma.chapter.upsert({
    where: { id: "emia-geometrie-analytique" },
    update: {},
    create: {
      id: "emia-geometrie-analytique",
      subjectId: emiaMathSubject.id,
      title: "Géométrie analytique",
      description: "Étude des figures géométriques par des méthodes algébriques",
      order: 2,
      isPublished: true,
    },
  });

  const emiaTrigonometrieChapter = await prisma.chapter.upsert({
    where: { id: "emia-trigonometrie" },
    update: {},
    create: {
      id: "emia-trigonometrie",
      subjectId: emiaMathSubject.id,
      title: "Trigonométrie",
      description: "Fonctions trigonométriques, triangles, cercle trigonométrique",
      order: 3,
      isPublished: true,
    },
  });

  // EMIA - Physique chapters
  const emiaMecaniqueChapter = await prisma.chapter.upsert({
    where: { id: "emia-mecanique" },
    update: {},
    create: {
      id: "emia-mecanique",
      subjectId: emiaPhysiqueSubject.id,
      title: "Mécanique",
      description: "Cinématique, dynamique, énergie mécanique",
      order: 1,
      isPublished: true,
    },
  });

  const emiaThermodynamiqueChapter = await prisma.chapter.upsert({
    where: { id: "emia-thermodynamique" },
    update: {},
    create: {
      id: "emia-thermodynamique",
      subjectId: emiaPhysiqueSubject.id,
      title: "Thermodynamique",
      description: "Température, chaleur, lois de la thermodynamique",
      order: 2,
      isPublished: true,
    },
  });

  // Create comprehensive lessons with real educational content

  // ENAM - Histoire du Cameroun lessons
  await prisma.lesson.upsert({
    where: { id: "enam-histoire-lesson-1" },
    update: {},
    create: {
      id: "enam-histoire-lesson-1",
      chapterId: enamHistoireChapter.id,
      title: "Préhistoire et Protohistoire du Cameroun",
      content: "La Préhistoire du Cameroun s'étend de la découverte des premiers outils en passant par l'apparition de l'homme moderne jusqu'à l'âge du fer. Les premières civilisations sont apparues vers 3000 ans avant J.-C. avec l'arrivée des Bantous venus du nord-est du Cameroun. L'âge du fer (500 av. J.-C. - 1500 ap. J.-C.) a vu l'émergence de royaumes organisés comme ceux des Tikar et des Bamoun. L'histoire ancienne du Cameroun est marquée par l'arrivée progressive des populations bantoues qui ont apporté avec elles l'agriculture et le fer. Ces migrations ont eu lieu sur plusieurs millénaires et ont profondément transformé le paysage culturel et linguistique de la région. Les premiers contacts avec les populations pygmées et peuls ont également eu lieu durant cette période.",
      order: 1,
      duration: 90,
      isPublished: true,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "enam-histoire-lesson-2" },
    update: {},
    create: {
      id: "enam-histoire-lesson-2",
      chapterId: enamHistoireChapter.id,
      title: "Période coloniale allemande (1884-1916)",
      content: "Le Cameroun est devenu colonie allemande en 1884 avec l'établissement du protectorat allemand. Cette période a été marquée par la construction d'infrastructures (chemins de fer, routes) et l'introduction de cultures commerciales comme le cacao et le café. Cependant, elle a aussi été caractérisée par une exploitation économique intense et des révoltes locales comme celle des Douala en 1910. La colonisation allemande a profondément transformé la société camerounaise. L'administration allemande a mis en place un système de gouvernance indirecte en s'appuyant sur les chefs traditionnels locaux. Elle a également introduit des cultures d'exportation comme le cacao, le café et le palmier à huile. Malgré ces développements économiques, les conditions de travail étaient difficiles pour les populations locales. La résistance contre la domination allemande a pris plusieurs formes, notamment la révolte des Douala en 1910 et celle de l'Ethnie des Nso en 1914. La Première Guerre mondiale a mis fin à la domination allemande avec la victoire des forces britanniques et françaises en 1916.",
      order: 2,
      duration: 90,
      isPublished: true,
    },
  });

  // ENAM - Géographie du Cameroun lessons
  await prisma.lesson.upsert({
    where: { id: "enam-geographie-lesson-1" },
    update: {},
    create: {
      id: "enam-geographie-lesson-1",
      chapterId: enamGeographieChapter.id,
      title: "Situation géographique et limites du Cameroun",
      content: "Le Cameroun est un pays d'Afrique centrale situé entre les latitudes 2°N et 13°N et les longitudes 8°E et 16°E. Il est bordé par le Nigeria à l'ouest, le Tchad au nord-est, le Soudan du Sud à l'est, la République centrafricaine au sud-est, la République du Congo, le Gabon et la Guinée équatoriale au sud. Il possède une façade maritime de 402 km sur le golfe de Guinée. Le Cameroun est souvent surnommé 'l'Afrique en miniature' en raison de sa diversité géographique, climatique et culturelle. Le pays s'étend sur environ 475 442 km² et comprend une grande variété de paysages, du littoral étroit et montagneux au sud jusqu'aux hautes terres du nord. Cette position stratégique en Afrique centrale en fait un carrefour important pour les échanges commerciaux et culturels de la région. Les frontières du Cameroun ont été largement définies lors de la Conférence de Berlin de 1884-1885, bien que certaines zones frontalières restent encore contestées, notamment avec le Nigeria.",
      order: 1,
      duration: 90,
      isPublished: true,
    },
  });

  // ENAM - Institutions politiques lessons
  await prisma.lesson.upsert({
    where: { id: "enam-institutions-lesson-1" },
    update: {},
    create: {
      id: "enam-institutions-lesson-1",
      chapterId: enamInstitutionsChapter.id,
      title: "La Constitution de la République du Cameroun",
      content: "La Constitution actuelle du Cameroun date du 18 janvier 1996, avec des révisions importantes en 2008. Elle établit un régime semi-présidentiel avec une séparation des pouvoirs. Le Président de la République est élu pour sept ans par un collège électoral comprenant les députés, les sénateurs et les maires. Le Premier ministre est nommé par le Président et dirige le gouvernement. Le Parlement bicaméral est composé de l'Assemblée nationale (180 députés) et du Sénat (100 sénateurs). Le système judiciaire est organisé en plusieurs ordres de juridictions : judiciaire, administratif et coutumier. La Constitution de 1996 a introduit des réformes importantes dans le système politique camerounais. Elle a notamment établi un régime semi-présidentiel avec un Président de la République élu pour sept ans et un Premier ministre nommé par le Président. Le Parlement bicaméral comprend l'Assemblée nationale et le Sénat. L'Assemblée nationale compte 180 députés élus pour cinq ans, tandis que le Sénat compte 100 sénateurs (70 élus par les conseils départementaux et 30 désignés par le Président). La Constitution garantit également l'indépendance de l'autorité judiciaire et prévoit la création d'institutions de contrôle comme la Cour des comptes et le Conseil constitutionnel.",
      order: 1,
      duration: 120,
      isPublished: true,
    },
  });

  // ENAM - Actualités internationales lessons
  await prisma.lesson.upsert({
    where: { id: "enam-actualites-lesson-1" },
    update: {},
    create: {
      id: "enam-actualites-lesson-1",
      chapterId: enamActualitesChapter.id,
      title: "L'Organisation des Nations Unies (ONU)",
      content: "L'ONU a été créée en 1945 après la Seconde Guerre mondiale pour maintenir la paix et la sécurité internationales. Elle compte actuellement 193 États membres. Ses principaux organes sont l'Assemblée générale, le Conseil de sécurité, le Conseil économique et social, le Conseil de tutelle, la Cour internationale de justice et le Secrétaire général. Le Conseil de sécurité, composé de 15 membres (5 permanents avec droit de veto et 10 élus pour deux ans), est chargé du maintien de la paix. L'ONU intervient dans les domaines de la paix, du développement, des droits de l'homme et de l'aide humanitaire. L'Organisation des Nations Unies est l'organisation internationale la plus importante au monde. Fondée en 1945 à la suite de la Seconde Guerre mondiale, son objectif principal est de maintenir la paix et la sécurité internationales. L'ONU dispose de six organes principaux : l'Assemblée générale (organe délibérant), le Conseil de sécurité (chargé du maintien de la paix), le Conseil économique et social (ECOSOC), le Conseil de tutelle, la Cour internationale de justice et le Secrétariat dirigé par le Secrétaire général. Le Conseil de sécurité est particulièrement important car il peut prendre des décisions contraignantes pour les États membres. Il comprend 15 membres : 5 permanents (États-Unis, Russie, Chine, France, Royaume-Uni) avec droit de veto et 10 membres élus pour deux ans. L'ONU intervient dans de nombreux domaines tels que les opérations de maintien de la paix, l'aide humanitaire, la promotion des droits de l'homme et le développement durable.",
      order: 1,
      duration: 90,
      isPublished: true,
    },
  });

  // ENAM - Droit constitutionnel lessons
  await prisma.lesson.upsert({
    where: { id: "enam-droit-const-lesson-1" },
    update: {},
    create: {
      id: "enam-droit-const-lesson-1",
      chapterId: enamDroitConstitutionnelChapter.id,
      title: "Les sources du droit constitutionnel",
      content: "Les sources du droit constitutionnel comprennent la Constitution, les lois organiques, les lois ordinaires, la jurisprudence et les principes généraux du droit. La Constitution est la source primordiale qui organise les institutions et définit les droits fondamentaux. Les lois organiques, prévues par la Constitution, réglementent l'organisation des institutions. La jurisprudence, notamment celle du Conseil constitutionnel et de la Cour de cassation, interprète et complète les textes. Les principes généraux du droit, issus de la doctrine et des conventions internationales, complètent le système. Dans le système juridique camerounais, les sources du droit constitutionnel sont hiérarchisées. La Constitution est la norme suprême du système juridique. Elle est suivie par les lois organiques qui doivent être adoptées dans les conditions spécifiques prévues par la Constitution. Les lois ordinaires viennent ensuite, suivies par les règlements et les actes administratifs. La jurisprudence du Conseil constitutionnel et de la Cour suprême joue un rôle important dans l'interprétation des textes constitutionnels. Les principes généraux du droit, issus de la doctrine juridique et des conventions internationales ratifiées par le Cameroun, constituent également des sources importantes du droit constitutionnel. Le droit comparé, notamment les constitutions des autres pays et les textes internationaux, influence également l'évolution du droit constitutionnel camerounais.",
      order: 1,
      duration: 120,
      isPublished: true,
    },
  });

  // ENAM - Droit administratif lessons
  await prisma.lesson.upsert({
    where: { id: "enam-droit-admin-lesson-1" },
    update: {},
    create: {
      id: "enam-droit-admin-lesson-1",
      chapterId: enamDroitAdministratifChapter.id,
      title: "Principes généraux du droit administratif",
      content: "Le droit administratif régit l'activité des administrations publiques. Ses principes fondamentaux incluent la légalité (les administrations doivent agir dans le respect de la loi), la responsabilité (l'administration est responsable de ses actes), l'égalité (traitement égal des administrés) et la continuité du service public. L'administration jouit de prérogatives de puissance publique (police, tutelle, sanctions) qui lui permettent d'assurer le bon fonctionnement des services publics. Le contrôle juridictionnel de l'administration est exercé par les juridictions administratives. Le droit administratif camerounais repose sur plusieurs principes fondamentaux. Le principe de légalité exige que l'administration agisse dans le respect strict de la loi et ne puisse faire ce que la loi ne lui permet pas. Le principe de responsabilité implique que l'administration soit responsable de ses actes et puisse être condamnée à réparer les dommages causés aux administrés. Le principe d'égalité devant les charges publiques garantit que tous les citoyens soient traités de manière égale par l'administration. Le principe de continuité du service public impose à l'administration de maintenir le fonctionnement des services publics essentiels. L'administration dispose de prérogatives de puissance publique telles que le pouvoir de police (maintien de l'ordre public), le pouvoir de tutelle (contrôle sur les collectivités territoriales) et le pouvoir de sanction (pouvoir de punir). Ces prérogatives sont encadrées par la loi et peuvent faire l'objet d'un recours devant les juridictions administratives.",
      order: 1,
      duration: 120,
      isPublished: true,
    },
  });

  // ENS Lettres - Le romantisme lessons
  await prisma.lesson.upsert({
    where: { id: "ens-romantisme-lesson-1" },
    update: {},
    create: {
      id: "ens-romantisme-lesson-1",
      chapterId: ensRomantismeChapter.id,
      title: "Caractéristiques du mouvement romantique",
      content: "Le romantisme est un mouvement littéraire et artistique apparu au début du XIXe siècle en réaction au rationalisme des Lumières et à l'esthétique classique. Ses caractéristiques principales incluent l'exaltation du moi, le culte de la nature, l'intérêt pour le passé médiéval, l'expression des sentiments intenses et l'engagement politique. Les romantiques valorisent l'individu, l'originalité et l'imagination. Ils s'opposent aux règles strictes du classicisme et privilégient l'expression libre des émotions. Le romantisme met en avant des thèmes comme l'amour passionnel, la mélancolie, le désespoir et la révolte contre la société. Dans la littérature française, le romantisme s'est affirmé avec Victor Hugo, Alphonse de Lamartine, Alfred de Musset et George Sand. Le mouvement romantique a profondément transformé la littérature en donnant une place centrale au moi lyrique et à l'expression des sentiments. Le romantique est un individu tourmenté qui s'oppose à la société et cherche à exprimer ses émotions intenses. La nature est un thème majeur du romantisme, souvent utilisée comme miroir des sentiments du poète. Le romantisme s'intéresse également au passé médiéval, aux légendes et aux paysages exotiques. Le mouvement valorise l'imagination et la créativité par rapport à la raison classique. L'engagement politique est également une caractéristique importante du romantisme, notamment à travers la célébration de la liberté et de l'indépendance.",
      order: 1,
      duration: 90,
      isPublished: true,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "ens-romantisme-lesson-2" },
    update: {},
    create: {
      id: "ens-romantisme-lesson-2",
      chapterId: ensRomantismeChapter.id,
      title: "Les grands auteurs romantiques",
      content: "Victor Hugo est considéré comme le chef de file du romantisme français avec des œuvres comme 'Notre-Dame de Paris' (1831) et 'Les Misérables' (1862). Son drame 'Hernani' (1830) a marqué la victoire du romantisme sur le classicisme. Alphonse de Lamartine, avec ses 'Méditations poétiques' (1820), a introduit le lyrisme romantique dans la poésie. Alfred de Musset, auteur de pièces comme 'Lorenzaccio' (1834) et de poèmes comme 'Les Nuits', incarne le romantisme tourmenté. George Sand, romancière prolifique, a défendu les idéaux romantiques dans des œuvres comme 'Indiana' (1832) et 'La Mare au Diable' (1846). Chateaubriand, avec 'René' (1802) et 'Les Martyrs' (1809), est un précurseur du romantisme en littérature. Victor Hugo est incontestablement le plus grand représentant du romantisme français. Son œuvre poétique commence avec les 'Odes et Ballades' (1826) et se développe avec les 'Feuilles d'automne' (1831) et les 'Chants du crépuscule' (1835). Ses romans, notamment 'Notre-Dame de Paris' et 'Les Misérables', sont des chefs-d'œuvre qui combinent lyrisme, engagement social et puissance narrative. Alphonse de Lamartine a révolutionné la poésie française avec ses 'Méditations poétiques', qui expriment une sensibilité nouvelle et une communion avec la nature. Alfred de Musset, avec sa poésie des 'Nuits' et ses comédies comme 'On ne badine pas avec l'amour', incarne le romantisme personnel et tourmenté. George Sand, romancière féministe avant l'heure, a exploré les thèmes de l'amour libre et de l'émancipation féminine dans ses romans. Chateaubriand, avec 'Atala' (1801) et 'René' (1802), a introduit le mal du siècle dans la littérature française.",
      order: 2,
      duration: 90,
      isPublished: true,
    },
  });

  // ENS Lettres - Le Parnasse et le Symbolisme lessons
  await prisma.lesson.upsert({
    where: { id: "ens-parnasse-lesson-1" },
    update: {},
    create: {
      id: "ens-parnasse-lesson-1",
      chapterId: ensParnasseChapter.id,
      title: "Principes esthétiques du Parnasse",
      content: "Le Parnasse est un mouvement poétique français apparu dans les années 1860. Il se caractérise par le culte de l'art pour l'art, l'objectivité, le souci de la forme parfaite et l'évitement de toute subjectivité. Les poètes parnassiens rejettent l'expression des sentiments personnels et privilégient une poésie impersonnelle et plastique. Ils recherchent la précision des images, la richesse des rimes et l'harmonie des vers. Le mouvement est incarné par des poètes comme Leconte de Lisle, Théodore de Banville, Sully Prudhomme et José-Maria de Heredia. Le Parnasse a émergé comme une réaction contre l'excès de subjectivité romantique. Ses principes esthétiques sont résumés dans la formule 'l'art pour l'art', qui signifie que l'œuvre d'art doit être belle en elle-même sans visée morale ou sociale. Les poètes parnassiens s'efforcent d'atteindre la perfection formelle en mettant l'accent sur la technique poétique. Ils privilégient des thèmes objectifs comme l'histoire, la mythologie et la nature contemplée de manière distante. Le mouvement a contribué à renouveler la poésie française en apportant une rigueur formelle et une recherche de beauté plastique. L'influence du Parnasse s'étend jusqu'au symbolisme qui en reprend certains aspects tout en les transformant.",
      order: 1,
      duration: 90,
      isPublished: true,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "ens-parnasse-lesson-2" },
    update: {},
    create: {
      id: "ens-parnasse-lesson-2",
      chapterId: ensParnasseChapter.id,
      title: "Le Symbolisme et ses poètes",
      content: "Le symbolisme est un mouvement littéraire apparu dans les années 1880. Il se caractérise par l'expression des états d'âme complexes, l'utilisation de symboles et de correspondances, et une poésie suggestive plutôt que descriptive. Les symbolistes cherchent à exprimer l'inexprimable et à évoquer des sensations plutôt que de les décrire. Ils s'inspirent des théories esthétiques de Baudelaire et des écrits de Mallarmé. Les principaux représentants sont Stéphane Mallarmé, Paul Verlaine, Arthur Rimbaud et Jules Laforgue. Le symbolisme a profondément influencé la poésie moderne et a préparé l'avènement des mouvements littéraires du XXe siècle. Le symbolisme représente une évolution importante par rapport au Parnasse. Alors que les parnassiens recherchaient l'objectivité et la perfection formelle, les symbolistes s'intéressent aux états d'âme complexes et aux impressions intérieures. Le poème symboliste devient un instrument pour évoquer des sensations et des émotions plutôt que pour décrire des objets. Le symboliste utilise des symboles, des correspondances sensorielles et des images suggestives. La musique des vers et l'atmosphère créée par les mots prennent plus d'importance que le sens littéral. Mallarmé, avec ses 'Poésies' et son célèbre 'Après-midi d'un faune', a théorisé cette approche poétique. Verlaine, dans 'Romances sans paroles', explore les nuances émotionnelles. Rimbaud, avec 'Illuminations' et 'Une saison en enfer', pousse l'expérimentation symboliste jusqu'à ses extrémités.",
      order: 2,
      duration: 90,
      isPublished: true,
    },
  });

  // ENS Sciences - Algèbre linéaire lessons
  await prisma.lesson.upsert({
    where: { id: "ens-algebre-lesson-1" },
    update: {},
    create: {
      id: "ens-algebre-lesson-1",
      chapterId: ensAlgebreChapter.id,
      title: "Espaces vectoriels et sous-espaces",
      content: "Un espace vectoriel sur un corps K (généralement ℝ ou ℂ) est un ensemble E muni d'une loi interne (addition) et d'une loi externe (multiplication par un scalaire) vérifiant certaines propriétés. L'addition doit être commutative, associative, posséder un élément neutre (le vecteur nul) et tout élément doit avoir un opposé. La multiplication par un scalaire doit être compatible avec la multiplication dans le corps K. Un sous-espace vectoriel F d'un espace vectoriel E est un sous-ensemble de E qui est stable par combinaison linéaire. Cela signifie que si u et v appartiennent à F, alors au + bv appartient à F pour tous scalaires a et b. Les exemples fondamentaux d'espaces vectoriels incluent ℝⁿ, l'ensemble des polynômes de degré inférieur ou égal à n, et l'ensemble des fonctions continues sur un intervalle. Un espace vectoriel est une structure algébrique fondamentale en mathématiques. La notion d'espace vectoriel généralise les propriétés des vecteurs géométriques du plan et de l'espace. Les huit axiomes définissant un espace vectoriel garantissent que les opérations de base (addition de vecteurs et multiplication par un scalaire) se comportent de manière cohérente. Un sous-espace vectoriel est un sous-ensemble qui hérite de la structure d'espace vectoriel. Pour vérifier qu'un sous-ensemble est un sous-espace vectoriel, il suffit de vérifier qu'il est non vide et stable par combinaison linéaire. La notion de combinaison linéaire est centrale : une combinaison linéaire de vecteurs v₁, v₂, ..., vₚ est une expression de la forme a₁v₁ + a₂v₂ + ... + aₚvₚ où les aᵢ sont des scalaires. Les espaces vectoriels de dimension finie possèdent une base, c'est-à-dire un ensemble de vecteurs linéairement indépendants qui engendrent l'espace entier.",
      order: 1,
      duration: 120,
      isPublished: true,
    },
  });

  // ENS Sciences - Analyse mathématique lessons
  await prisma.lesson.upsert({
    where: { id: "ens-analyse-lesson-1" },
    update: {},
    create: {
      id: "ens-analyse-lesson-1",
      chapterId: ensAnalyseChapter.id,
      title: "Suites numériques et convergence",
      content: "Une suite numérique est une fonction de ℕ dans ℝ (ou ℂ). Elle est notée (uₙ)ₙ∈ℕ ou simplement (uₙ). Une suite converge vers une limite l si pour tout ε > 0, il existe un entier N tel que pour tout n ≥ N, |uₙ - l| < ε. Cela signifie que les termes de la suite se rapprochent arbitrairement de la limite. Une suite est dite divergente si elle n'est pas convergente. Elle peut tendre vers l'infini ou osciller sans limite. Les suites monotones bornées convergent toujours (théorème de convergence monotone). Les suites extraites jouent un rôle important dans l'étude de la convergence. Une suite (uₙ) est de Cauchy si pour tout ε > 0, il existe N tel que pour tous m,n ≥ N, |uₘ - uₙ| < ε. Dans ℝ, une suite est convergente si et seulement si elle est de Cauchy. Les suites numériques constituent le fondement de l'analyse mathématique. La notion de limite est centrale et permet de définir la continuité, la dérivabilité et l'intégrabilité des fonctions. La convergence d'une suite exprime l'idée intuitive que ses termes se rapprochent indéfiniment d'une certaine valeur. La définition formelle de la convergence (définition ε-N) est un exemple fondamental de définition mathématique utilisant des quantificateurs. Les suites convergentes vérifient de nombreuses propriétés algébriques : la limite d'une somme est la somme des limites (sous réserve d'existence), la limite d'un produit est le produit des limites, etc. Les suites monotones bornées convergent toujours, ce qui permet de démontrer l'existence de certaines limites sans les connaître explicitement. Les suites de Cauchy, qui vérifient une condition de régularité uniforme, caractérisent la complétude de ℝ : toute suite de Cauchy converge dans ℝ.",
      order: 1,
      duration: 120,
      isPublished: true,
    },
  });

  // ENS Sciences - Mécanique classique lessons
  await prisma.lesson.upsert({
    where: { id: "ens-mecanique-lesson-1" },
    update: {},
    create: {
      id: "ens-mecanique-lesson-1",
      chapterId: ensMecaniqueChapter.id,
      title: "Cinématique du point matériel",
      content: "La cinématique est l'étude du mouvement des corps sans s'occuper des causes qui le produisent. Un point matériel est un objet dont les dimensions sont négligeables devant les distances caractéristiques du mouvement étudié. La position d'un point M est repérée par son vecteur position ⃗r(t) dans un repère orthonormé. La trajectoire est l'ensemble des positions successives du point. La vitesse est définie comme la dérivée du vecteur position par rapport au temps : ⃗v = d⃗r/dt. L'accélération est la dérivée de la vitesse : ⃗a = d⃗v/dt = d²⃗r/dt². Dans un repère cartésien, les composantes du vecteur position sont x(t), y(t), z(t), celles de la vitesse sont vx = dx/dt, vy = dy/dt, vz = dz/dt, et celles de l'accélération sont ax = dvx/dt, ay = dvy/dt, az = dvz/dt. La cinématique du point matériel constitue la base de la mécanique classique. Elle permet de décrire précisément le mouvement d'un objet en fonction du temps. Le choix du repère est crucial pour simplifier les équations du mouvement. Les coordonnées cartésiennes sont adaptées aux mouvements rectilignes, tandis que les coordonnées polaires sont plus appropriées pour les mouvements circulaires ou à symétrie centrale. La trajectoire d'un point matériel peut prendre différentes formes : rectiligne, circulaire, parabolique, etc. La vitesse instantanée est un vecteur tangent à la trajectoire en chaque point. L'accélération peut avoir deux composantes : une composante tangentielle responsable de la variation de la vitesse et une composante normale responsable du changement de direction. La cinématique permet d'établir les relations entre position, vitesse et accélération qui sont essentielles pour résoudre les problèmes de mécanique.",
      order: 1,
      duration: 120,
      isPublished: true,
    },
  });

  // ENS Sciences - Électromagnétisme lessons
  await prisma.lesson.upsert({
    where: { id: "ens-electromag-lesson-1" },
    update: {},
    create: {
      id: "ens-electromag-lesson-1",
      chapterId: ensElectromagnetismeChapter.id,
      title: "Loi de Coulomb et champ électrostatique",
      content: "La loi de Coulomb décrit la force exercée entre deux charges ponctuelles q₁ et q₂ séparées par une distance r : F = k(q₁q₂/r²)û où k = 1/(4πε₀) est la constante de Coulomb, ε₀ la permittivité du vide et û le vecteur unitaire dirigé de q₁ vers q₂. La force est attractive si les charges sont de signes opposés et répulsive si elles sont de même signe. Le champ électrostatique créé par une charge q en un point M est défini comme la force par unité de charge que subirait une charge test placée en M : ⃗E = ⃗F/q₀. Pour une charge ponctuelle q, le champ en un point M à distance r est ⃗E = k(q/r²)ûᵣ où ûᵣ est le vecteur unitaire radial. Le principe de superposition s'applique : le champ créé par un ensemble de charges est la somme vectorielle des champs créés par chaque charge individuellement. Les lignes de champ électrostatique sont des courbes tangentes en chaque point au vecteur champ. Elles sortent des charges positives et entrent dans les charges négatives. La loi de Coulomb constitue le fondement de l'électrostatique. Elle exprime que les forces électriques sont proportionnelles au produit des charges et inversement proportionnelles au carré de la distance, comme la loi de la gravitation universelle de Newton. La constante de Coulomb k = 9×10⁹ N⋅m²/C² dans le système international d'unités. Le champ électrostatique est une grandeur vectorielle qui décrit l'influence d'une charge électrique sur l'espace environnant. Le principe de superposition permet de calculer le champ créé par des distributions de charges complexes. La notion de lignes de champ introduite par Faraday permet de visualiser le champ électrostatique. Le flux du champ électrique à travers une surface fermée est proportionnel à la charge intérieure (théorème de Gauss). Cette loi fondamentale permet de comprendre et de prédire le comportement des charges électriques et des champs qu'elles créent.",
      order: 1,
      duration: 120,
      isPublished: true,
    },
  });

  // ENS Sciences - Chimie générale lessons
  await prisma.lesson.upsert({
    where: { id: "ens-chimie-gen-lesson-1" },
    update: {},
    create: {
      id: "ens-chimie-gen-lesson-1",
      chapterId: ensChimieGeneraleChapter.id,
      title: "Structure atomique et classification périodique",
      content: "L'atome est constitué d'un noyau central chargé positivement, autour duquel gravitent des électrons chargés négativement. Le noyau contient des protons (charge +e) et des neutrons (charge nulle). Le nombre de protons définit le numéro atomique Z et détermine l'élément chimique. Le nombre de masse A est la somme du nombre de protons et de neutrons. Les isotopes sont des atomes d'un même élément ayant le même nombre de protons mais des nombres de neutrons différents. Les électrons occupent des niveaux d'énergie quantifiés autour du noyau. La configuration électronique détermine les propriétés chimiques des éléments. La classification périodique des éléments, établie par Mendeleïev, classe les éléments par numéro atomique croissant. Les éléments d'une même colonne (groupe) ont des propriétés chimiques similaires. Les éléments d'une même ligne (période) ont le même nombre de couches électroniques. La structure atomique explique la formation des liaisons chimiques et les propriétés des éléments. L'atome est le constituant fondamental de la matière. Sa structure a été élucidée progressivement au cours du XXe siècle. Le modèle de Rutherford (1911) a établi l'existence d'un noyau dense et chargé positivement. Le modèle de Bohr (1913) a introduit la quantification des niveaux d'énergie. La mécanique quantique a permis de comprendre la nature ondulatoire des électrons et leur distribution dans les atomes. La configuration électronique des atomes détermine leurs propriétés chimiques. Les électrons de valence, situés sur la couche externe, sont responsables des liaisons chimiques. La classification périodique reflète la périodicité des propriétés chimiques en fonction de la structure électronique. Les métaux se trouvent à gauche et au centre du tableau, les non-métaux à droite. Les gaz nobles, ayant une couche externe complète, sont chimiquement inertes. Cette compréhension de la structure atomique est essentielle pour expliquer la formation des liaisons chimiques et les réactions chimiques.",
      order: 1,
      duration: 120,
      isPublished: true,
    },
  });

  // ENS Sciences - Chimie organique lessons
  await prisma.lesson.upsert({
    where: { id: "ens-chimie-org-lesson-1" },
    update: {},
    create: {
      id: "ens-chimie-org-lesson-1",
      chapterId: ensChimieOrganiqueChapter.id,
      title: "Hydrocarbures saturés - Alcanes",
      content: "Les alcanes sont des hydrocarbures saturés de formule générale CₙH₂ₙ₊₂. Ils ne contiennent que des liaisons simples C-C et C-H. Les alcanes constituent le premier groupe de composés organiques étudiés. Le méthane (CH₄) est l'alcane le plus simple. Les alcanes sont apolaires et peu réactifs chimiquement. Ils subissent principalement des réactions de substitution radicalaire sous l'effet de la lumière ou de la chaleur. La nomenclature des alcanes suit les règles de l'UICPA : on choisit la chaîne carbonée la plus longue comme chaîne principale, on numérote les atomes de carbone de manière à donner les plus petits numéros aux substituants, et on nomme les substituants par ordre alphabétique. Les alcanes sont des composés très importants industriellement comme sources d'énergie (pétrole, gaz naturel) et comme matières premières pour l'industrie chimique. Les alcanes constituent la famille la plus simple des composés organiques. Leur structure ne contient que des liaisons simples, ce qui leur confère une géométrie tétraédrique autour de chaque atome de carbone. Cette saturation en liaisons leur donne une grande stabilité chimique. Les premiers alcanes sont gazeux (méthane, éthane, propane, butane), les alcanes moyens sont liquides (pentane à hexadécane), et les alcanes longs sont solides. Les alcanes subissent principalement des réactions de combustion complète (en présence d'excès d'oxygène) produisant du dioxyde de carbone et de l'eau, et des réactions de substitution radicalaire avec le dichlore ou le dibrome sous l'effet de la lumière. La nomenclature systématique permet d'identifier de manière univoque chaque alcane. Les isomères de chaîne, ayant la même formule moléculaire mais des structures différentes, sont nombreux à partir du butane. La connaissance des alcanes est essentielle pour comprendre la chimie du pétrole et les réactions de substitution radicalaire.",
      order: 1,
      duration: 120,
      isPublished: true,
    },
  });

  // EMIA - Algèbre lessons
  await prisma.lesson.upsert({
    where: { id: "emia-algebre-lesson-1" },
    update: {},
    create: {
      id: "emia-algebre-lesson-1",
      chapterId: emiaAlgebreChapter.id,
      title: "Équations du premier degré à une inconnue",
      content: "Une équation du premier degré à une inconnue est une égalité de la forme ax + b = 0 où a et b sont des nombres réels et a ≠ 0. La solution est x = -b/a. Pour résoudre une équation du premier degré, on utilise les propriétés d'égalité : on peut ajouter ou soustraire le même nombre aux deux membres, multiplier ou diviser les deux membres par un même nombre non nul. La méthode générale consiste à isoler l'inconnue dans un membre de l'équation. Exemple : 3x + 5 = 2x + 10. On soustrait 2x des deux côtés : x + 5 = 10. On soustrait 5 des deux côtés : x = 5. Une équation du premier degré à une inconnue peut toujours être mise sous la forme ax + b = 0 où a ≠ 0. La résolution d'une telle équation repose sur les propriétés fondamentales de l'égalité. Si on ajoute ou soustrait le même nombre aux deux membres d'une équation, on obtient une équation équivalente. De même, si on multiplie ou divise les deux membres par un même nombre non nul, l'équation reste équivalente. La méthode de résolution consiste à regrouper tous les termes contenant l'inconnue dans un membre et tous les termes constants dans l'autre membre. Ensuite, on divise par le coefficient de l'inconnue pour obtenir la solution. Il est important de vérifier la solution en la substituant dans l'équation originale. L'étude des équations du premier degré constitue le fondement de l'algèbre et est essentielle pour la résolution de problèmes concrets en mathématiques et en sciences.",
      order: 1,
      duration: 90,
      isPublished: true,
    },
  });

  // EMIA - Géométrie analytique lessons
  await prisma.lesson.upsert({
    where: { id: "emia-geometrie-lesson-1" },
    update: {},
    create: {
      id: "emia-geometrie-lesson-1",
      chapterId: emiaGeometrieChapter.id,
      title: "Repérage dans le plan - Coordonnées cartésiennes",
      content: "Dans un plan muni d'un repère orthonormé (O, I, J), chaque point M est repéré par un couple de nombres (x, y) appelés coordonnées du point. x est l'abscisse et y est l'ordonnée. La distance entre deux points A(xA, yA) et B(xB, yB) est donnée par la formule : AB = √[(xB - xA)² + (yB - yA)²]. Le milieu I d'un segment [AB] a pour coordonnées ((xA + xB)/2, (yA + yB)/2). Ces notions sont fondamentales pour étudier les figures géométriques par des méthodes algébriques. Le repérage dans le plan est un outil essentiel de la géométrie analytique. Il permet de traduire des propriétés géométriques en équations algébriques. Un repère orthonormé est constitué de deux axes perpendiculaires gradués de même unité. L'origine O est le point d'intersection des axes. L'axe horizontal est l'axe des abscisses et l'axe vertical est l'axe des ordonnées. Tout point du plan est alors repéré par un couple unique de coordonnées (x, y). La distance entre deux points se calcule à l'aide du théorème de Pythagore. La formule de la distance est une application directe de ce théorème. Le calcul des coordonnées du milieu d'un segment repose sur la notion de moyenne arithmétique. Ces concepts permettent de démontrer des propriétés géométriques par le calcul, ce qui constitue une approche puissante en mathématiques.",
      order: 1,
      duration: 90,
      isPublished: true,
    },
  });

  // EMIA - Trigonométrie lessons
  await prisma.lesson.upsert({
    where: { id: "emia-trigonometrie-lesson-1" },
    update: {},
    create: {
      id: "emia-trigonometrie-lesson-1",
      chapterId: emiaTrigonometrieChapter.id,
      title: "Fonctions trigonométriques de base",
      content: "Les fonctions trigonométriques sont définies à partir du cercle trigonométrique de rayon 1. Pour un angle α, on définit le cosinus comme l'abscisse du point M sur le cercle et le sinus comme son ordonnée. La tangente est le rapport sin(α)/cos(α). Les propriétés principales incluent : cos²(α) + sin²(α) = 1, cos(-α) = cos(α), sin(-α) = -sin(α). Les valeurs remarquables pour les angles 0°, 30°, 45°, 60°, 90° doivent être connues. Les fonctions trigonométriques sont périodiques : cos(α + 2π) = cos(α) et sin(α + 2π) = sin(α). Les formules d'addition permettent de calculer cos(a+b) et sin(a+b). La trigonométrie est essentielle pour résoudre les triangles et a de nombreuses applications en physique et en ingénierie. Les fonctions trigonométriques sont fondamentales en mathématiques. Elles permettent de modéliser des phénomènes périodiques comme les oscillations, les ondes et les mouvements circulaires. Le cercle trigonométrique est un outil essentiel pour comprendre ces fonctions. Le cosinus d'un angle correspond à l'abscisse du point sur le cercle, et le sinus à l'ordonnée. La tangente est le rapport du sinus sur le cosinus. Les propriétés de parité des fonctions trigonométriques sont importantes : le cosinus est une fonction paire et le sinus est une fonction impaire. Les formules d'addition et de duplication permettent de simplifier les expressions trigonométriques complexes. La résolution des triangles rectangles utilise les relations trigonométriques entre les côtés et les angles. La trigonométrie est utilisée dans de nombreux domaines scientifiques et techniques, notamment en électricité, en mécanique et en optique.",
      order: 1,
      duration: 90,
      isPublished: true,
    },
  });

  // EMIA - Mécanique lessons
  await prisma.lesson.upsert({
    where: { id: "emia-mecanique-lesson-1" },
    update: {},
    create: {
      id: "emia-mecanique-lesson-1",
      chapterId: emiaMecaniqueChapter.id,
      title: "Lois de Newton de la mécanique",
      content: "Les trois lois de Newton forment les fondements de la mécanique classique. La première loi (principe d'inertie) stipule qu'un corps reste au repos ou en mouvement rectiligne uniforme si la somme des forces qui s'exercent sur lui est nulle. La deuxième loi (principe fondamental de la dynamique) énonce que la somme des forces est égale au produit de la masse par l'accélération : F = ma. La troisième loi (principe des actions réciproques) affirme que pour toute action, il existe une réaction égale et opposée. Ces lois permettent de résoudre la plupart des problèmes de mécanique. La première loi définit les référentiels galiléens dans lesquels les lois de la mécanique s'appliquent. La deuxième loi relie force, masse et accélération, permettant de prédire le mouvement d'un objet soumis à des forces. La troisième loi explique les interactions entre objets et est essentielle pour comprendre les systèmes de forces. Les applications incluent l'étude de la chute libre, du mouvement sur plan incliné, du pendule et des systèmes de poulies. Les lois de Newton constituent le socle de la mécanique classique. Elles décrivent le mouvement des objets macroscopiques à des vitesses faibles devant celle de la lumière. La première loi établit le concept d'inertie : un objet conserve son état de mouvement en l'absence de force nette. La deuxième loi quantifie la relation entre force, masse et accélération. La troisième loi exprime la nature réciproque des interactions : quand un objet A exerce une force sur un objet B, alors B exerce une force égale et opposée sur A. Ces principes permettent d'analyser des situations complexes comme les mouvements dans les champs de force, les collisions et les systèmes à plusieurs corps.",
      order: 1,
      duration: 120,
      isPublished: true,
    },
  });

  // EMIA - Thermodynamique lessons
  await prisma.lesson.upsert({
    where: { id: "emia-thermodynamique-lesson-1" },
    update: {},
    create: {
      id: "emia-thermodynamique-lesson-1",
      chapterId: emiaThermodynamiqueChapter.id,
      title: "Principes de la thermodynamique",
      content: "La thermodynamique étudie les échanges d'énergie sous forme de chaleur et de travail. Le premier principe (conservation de l'énergie) s'exprime par ΔU = Q - W, où ΔU est la variation d'énergie interne, Q la chaleur reçue et W le travail fourni par le système. Le second principe introduit la notion d'entropie et énonce que l'entropie d'un système isolé ne peut qu'augmenter. Le zéro absolu (0 K ou -273,15°C) est la température théorique où l'entropie atteint son minimum. Les transformations thermodynamiques incluent les isothermes (température constante), isobares (pression constante), isochore (volume constant) et adiabatiques (sans échange de chaleur). La thermodynamique est essentielle pour comprendre les moteurs thermiques, les réfrigérateurs et les systèmes énergétiques. La thermodynamique est la branche de la physique qui étudie les relations entre chaleur, travail, température et énergie. Le premier principe traduit la conservation de l'énergie : l'énergie interne d'un système peut varier par échange de chaleur ou de travail avec l'extérieur. Le second principe introduit la notion d'irréversibilité et définit le sens des transformations naturelles. Le troisième principe établit que l'entropie tend vers une valeur constante à zéro absolu. Les applications industrielles sont nombreuses : machines thermiques, réacteurs nucléaires, centrales électriques, climatiseurs. La thermodynamique statistique relie les propriétés microscopiques des particules aux propriétés macroscopiques des systèmes. Ces principes sont fondamentaux pour l'ingénierie et la chimie physique.",
      order: 1,
      duration: 120,
      isPublished: true,
    },
  });

  // Create enrollments with realistic data for different exam types
  await prisma.enrollment.upsert({
    where: {
      userId_classId: {
        userId: learner1.id,
        classId: ensLettresClass.id
      }
    },
    update: {},
    create: {
      userId: learner1.id,
      classId: ensLettresClass.id,
      status: "ACTIVE",
      enrolledAt: new Date('2024-02-05'),
    },
  });

  await prisma.enrollment.upsert({
    where: {
      userId_classId: {
        userId: learner2.id,
        classId: policeClass.id
      }
    },
    update: {},
    create: {
      userId: learner2.id,
      classId: policeClass.id,
      status: "ACTIVE",
      enrolledAt: new Date('2024-01-10'),
    },
  });

  // Create realistic payments
  await prisma.payment.upsert({
    where: { id: "payment-marie-ens" },
    update: {},
    create: {
      id: "payment-marie-ens",
      userId: learner1.id,
      classId: ensLettresClass.id,
      amount: 75000,
      method: "MTN_MOMO",
      status: "PAID",
      phoneNumber: "+237690123456",
      transactionId: "MOMO240205001",
      paidAt: new Date('2024-02-05'),
    },
  });

  await prisma.payment.upsert({
    where: { id: "payment-paul-police" },
    update: {},
    create: {
      id: "payment-paul-police",
      userId: learner2.id,
      classId: policeClass.id,
      amount: 45000,
      method: "ORANGE_MONEY",
      status: "PAID",
      phoneNumber: "+237677987654",
      transactionId: "OM240110001",
      paidAt: new Date('2024-01-10'),
    },
  });

  // Create a pending payment for testing
  await prisma.payment.upsert({
    where: { id: "payment-pending-douanes" },
    update: {},
    create: {
      id: "payment-pending-douanes",
      userId: learner1.id,
      classId: douanesClass.id,
      amount: 65000,
      method: "MTN_MOMO",
      status: "PENDING",
      phoneNumber: "+237690123456",
      transactionId: "MOMO240301001",
    },
  });

  console.log("Database seeding completed successfully!");
  console.log(`\n👥 Created users:`);
  console.log(`   Super Admin: ${superAdmin.email} / superadmin123`);
  console.log(`   Prep Admin: ${prepAdmin.email} / prepadmin123`);
  console.log(`   Teacher: ${teacher.email} / teacher123`);
  console.log(`   Learner 1: ${learner1.email} / learner123`);
  console.log(`   Learner 2: ${learner2.email} / student123`);
  console.log(`\n🎓 Created preparatory classes for Cameroon concours:`);
  console.log(`   ${enamClass.name} (${enamClass.price} FCFA)`);
  console.log(`   ${emiaClass.name} (${emiaClass.price} FCFA)`);
  console.log(`   ${ensLettresClass.name} (${ensLettresClass.price} FCFA)`);
  console.log(`   ${ensSciencesClass.name} (${ensSciencesClass.price} FCFA)`);
  console.log(`   ${ensetClass.name} (${ensetClass.price} FCFA)`);
  console.log(`   ${iricClass.name} (${iricClass.price} FCFA)`);
  console.log(`   ${paramedicalClass.name} (${paramedicalClass.price} FCFA)`);
  console.log(`   ${engineeringClass.name} (${engineeringClass.price} FCFA)`);
  console.log(`   ${fonctionPubliqueClass.name} (${fonctionPubliqueClass.price} FCFA)`);
  console.log(`   ${policeClass.name} (${policeClass.price} FCFA)`);
  console.log(`   ${douanesClass.name} (${douanesClass.price} FCFA)`);
  console.log(`\n📚 Created subjects matching official Cameroon concours curricula`);
  console.log(`\n💳 Created enrollments and payments for testing`);
  // Assign teachers to specific subjects
  console.log("Assigning teachers to subjects...");

  // Assign teacher to ENAM Culture Générale
  await prisma.classTeacher.upsert({
    where: {
      classId_teacherId_subjectId: {
        classId: enamClass.id,
        teacherId: teacher.id,
        subjectId: enamCultureSubject.id,
      },
    },
    update: {},
    create: {
      classId: enamClass.id,
      teacherId: teacher.id,
      subjectId: enamCultureSubject.id,
    },
  });

  // Assign teacher to ENS Lettres Français
  await prisma.classTeacher.upsert({
    where: {
      classId_teacherId_subjectId: {
        classId: ensLettresClass.id,
        teacherId: teacher.id,
        subjectId: ensLettresFrancaisSubject.id,
      },
    },
    update: {},
    create: {
      classId: ensLettresClass.id,
      teacherId: teacher.id,
      subjectId: ensLettresFrancaisSubject.id,
    },
  });

  console.log("\n📚 Created subjects matching official Cameroon concours curricula");
  console.log("\n💳 Created enrollments and payments for testing");
  console.log("\n🔐 All users can now login with their credentials!");
  console.log("\n👨‍🏫 Teachers assigned to specific subjects can now create content");
  console.log("\n📋 Preparatory Class Admins control overall content structure");

  main()
    .catch((e) => {
      console.error("❌ Error during seeding:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}