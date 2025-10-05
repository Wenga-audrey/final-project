import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seeding with hierarchical content management workflow...");

    // Create users with different roles
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

    // Create multiple teachers for different subjects
    const teacher1Password = await bcrypt.hash("teacher123", 12);
    const teacher1 = await prisma.user.upsert({
        where: { email: "teacher@mindboost.com" },
        update: {
            password: teacher1Password,
            firstName: "Jean",
            lastName: "Professeur",
            role: "TEACHER",
            isEmailVerified: true,
        },
        create: {
            email: "teacher@mindboost.com",
            password: teacher1Password,
            firstName: "Jean",
            lastName: "Professeur",
            role: "TEACHER",
            isEmailVerified: true,
        },
    });

    const teacher2Password = await bcrypt.hash("historyteacher123", 12);
    const teacher2 = await prisma.user.upsert({
        where: { email: "history.teacher@mindboost.com" },
        update: {
            password: teacher2Password,
            firstName: "Marie",
            lastName: "Historienne",
            role: "TEACHER",
            isEmailVerified: true,
        },
        create: {
            email: "history.teacher@mindboost.com",
            password: teacher2Password,
            firstName: "Marie",
            lastName: "Historienne",
            role: "TEACHER",
            isEmailVerified: true,
        },
    });

    const teacher3Password = await bcrypt.hash("literatureteacher123", 12);
    const teacher3 = await prisma.user.upsert({
        where: { email: "literature.teacher@mindboost.com" },
        update: {
            password: teacher3Password,
            firstName: "Pierre",
            lastName: "Littéraire",
            role: "TEACHER",
            isEmailVerified: true,
        },
        create: {
            email: "literature.teacher@mindboost.com",
            password: teacher3Password,
            firstName: "Pierre",
            lastName: "Littéraire",
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

    // Create a preparatory class (Prep Admin creates the class structure)
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

    // Prep Admin creates the subjects for the class
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

    // Prep Admin assigns teachers to specific subjects
    console.log("Assigning teachers to specific subjects...");

    // Assign History teacher to Culture Générale (which includes History)
    await prisma.classTeacher.upsert({
        where: {
            classId_teacherId_subjectId: {
                classId: enamClass.id,
                teacherId: teacher2.id,
                subjectId: enamCultureSubject.id,
            },
        },
        update: {},
        create: {
            classId: enamClass.id,
            teacherId: teacher2.id,
            subjectId: enamCultureSubject.id,
        },
    });

    // Assign Literature teacher to Langue subject
    await prisma.classTeacher.upsert({
        where: {
            classId_teacherId_subjectId: {
                classId: enamClass.id,
                teacherId: teacher3.id,
                subjectId: enamLangueSubject.id,
            },
        },
        update: {},
        create: {
            classId: enamClass.id,
            teacherId: teacher3.id,
            subjectId: enamLangueSubject.id,
        },
    });

    // Assign main teacher to Droit public
    await prisma.classTeacher.upsert({
        where: {
            classId_teacherId_subjectId: {
                classId: enamClass.id,
                teacherId: teacher1.id,
                subjectId: enamDroitPublicSubject.id,
            },
        },
        update: {},
        create: {
            classId: enamClass.id,
            teacherId: teacher1.id,
            subjectId: enamDroitPublicSubject.id,
        },
    });

    console.log("Teachers assigned to subjects:");
    console.log(`  - ${teacher2.firstName} ${teacher2.lastName} assigned to ${enamCultureSubject.name}`);
    console.log(`  - ${teacher3.firstName} ${teacher3.lastName} assigned to ${enamLangueSubject.name}`);
    console.log(`  - ${teacher1.firstName} ${teacher1.lastName} assigned to ${enamDroitPublicSubject.name}`);

    // Teachers create chapters and lessons for their assigned subjects
    console.log("Creating content for assigned subjects...");

    // History teacher creates content for Culture Générale
    const cultureGChapter1 = await prisma.chapter.upsert({
        where: { id: "enam-culture-histoire" },
        update: {},
        create: {
            id: "enam-culture-histoire",
            subjectId: enamCultureSubject.id,
            title: "Histoire du Cameroun",
            description: "Évolution historique du Cameroun depuis les origines jusqu'à nos jours",
            order: 1,
            duration: 120,
            isPublished: true,
        },
    });

    const cultureGLesson1 = await prisma.lesson.upsert({
        where: { id: "enam-culture-histoire-lesson1" },
        update: {},
        create: {
            id: "enam-culture-histoire-lesson1",
            chapterId: cultureGChapter1.id,
            title: "Période précoloniale",
            content: "Contenu détaillé sur la période précoloniale du Cameroun, incluant les royaumes et sultanats traditionnels...",
            order: 1,
            duration: 45,
            isPublished: true,
        },
    });

    const cultureGLesson2 = await prisma.lesson.upsert({
        where: { id: "enam-culture-histoire-lesson2" },
        update: {},
        create: {
            id: "enam-culture-histoire-lesson2",
            chapterId: cultureGChapter1.id,
            title: "Période coloniale",
            content: "Contenu détaillé sur la période coloniale du Cameroun, de 1884 à 1960...",
            order: 2,
            duration: 45,
            isPublished: true,
        },
    });

    // Literature teacher creates content for Langue
    const langueChapter1 = await prisma.chapter.upsert({
        where: { id: "enam-langue-expression" },
        update: {},
        create: {
            id: "enam-langue-expression",
            subjectId: enamLangueSubject.id,
            title: "Expression écrite",
            description: "Techniques d'expression écrite et rédaction administrative",
            order: 1,
            duration: 90,
            isPublished: true,
        },
    });

    const langueLesson1 = await prisma.lesson.upsert({
        where: { id: "enam-langue-expression-lesson1" },
        update: {},
        create: {
            id: "enam-langue-expression-lesson1",
            chapterId: langueChapter1.id,
            title: "Rédaction de courriers administratifs",
            content: "Guide détaillé pour la rédaction de courriers administratifs formels...",
            order: 1,
            duration: 45,
            isPublished: true,
        },
    });

    // Main teacher creates content for Droit public
    const droitChapter1 = await prisma.chapter.upsert({
        where: { id: "enam-droit-constitutionnel" },
        update: {},
        create: {
            id: "enam-droit-constitutionnel",
            subjectId: enamDroitPublicSubject.id,
            title: "Droit constitutionnel",
            description: "Étude de la Constitution de la République du Cameroun",
            order: 1,
            duration: 120,
            isPublished: true,
        },
    });

    const droitLesson1 = await prisma.lesson.upsert({
        where: { id: "enam-droit-constitutionnel-lesson1" },
        update: {},
        create: {
            id: "enam-droit-constitutionnel-lesson1",
            chapterId: droitChapter1.id,
            title: "Structure de l'État",
            content: "Analyse de la structure de l'État camerounais selon la Constitution de 1996...",
            order: 1,
            duration: 45,
            isPublished: true,
        },
    });

    // Create enrollments
    await prisma.enrollment.upsert({
        where: {
            userId_classId: {
                userId: learner1.id,
                classId: enamClass.id
            }
        },
        update: {},
        create: {
            userId: learner1.id,
            classId: enamClass.id,
            status: "ACTIVE",
            enrolledAt: new Date('2024-02-05'),
        },
    });

    await prisma.enrollment.upsert({
        where: {
            userId_classId: {
                userId: learner2.id,
                classId: enamClass.id
            }
        },
        update: {},
        create: {
            userId: learner2.id,
            classId: enamClass.id,
            status: "ACTIVE",
            enrolledAt: new Date('2024-01-10'),
        },
    });

    // Create payments
    await prisma.payment.upsert({
        where: { id: "payment-marie-enam" },
        update: {},
        create: {
            id: "payment-marie-enam",
            userId: learner1.id,
            classId: enamClass.id,
            amount: 85000,
            method: "MTN_MOMO",
            status: "PAID",
            phoneNumber: "+237690123456",
            transactionId: "MOMO240205001",
            paidAt: new Date('2024-02-05'),
        },
    });

    await prisma.payment.upsert({
        where: { id: "payment-paul-enam" },
        update: {},
        create: {
            id: "payment-paul-enam",
            userId: learner2.id,
            classId: enamClass.id,
            amount: 85000,
            method: "ORANGE_MONEY",
            status: "PAID",
            phoneNumber: "+237677987654",
            transactionId: "OM240110001",
            paidAt: new Date('2024-01-10'),
        },
    });

    console.log("✅ Database seeding completed successfully!");
    console.log(`\n👥 Created users:`);
    console.log(`   Super Admin: ${superAdmin.email} / superadmin123`);
    console.log(`   Prep Admin: ${prepAdmin.email} / prepadmin123`);
    console.log(`   Teacher 1 (Droit): ${teacher1.email} / teacher123`);
    console.log(`   Teacher 2 (Histoire): ${teacher2.email} / historyteacher123`);
    console.log(`   Teacher 3 (Littérature): ${teacher3.email} / literatureteacher123`);
    console.log(`   Learner 1: ${learner1.email} / learner123`);
    console.log(`   Learner 2: ${learner2.email} / student123`);
    console.log(`\n🎓 Created preparatory class:`);
    console.log(`   ${enamClass.name} (${enamClass.price} FCFA)`);
    console.log(`\n📚 Created subjects with teacher assignments:`);
    console.log(`   ${enamCultureSubject.name} - Assigned to: ${teacher2.firstName} ${teacher2.lastName}`);
    console.log(`   ${enamDroitPublicSubject.name} - Assigned to: ${teacher1.firstName} ${teacher1.lastName}`);
    console.log(`   ${enamLangueSubject.name} - Assigned to: ${teacher3.firstName} ${teacher3.lastName}`);
    console.log(`\n📖 Created sample content for each subject (chapters and lessons)`);
    console.log(`\n💳 Created enrollments and payments for testing`);
    console.log(`\n🔐 All users can now login with their credentials!`);
    console.log(`\n📋 Workflow implemented:`);
    console.log(`   1. Prep Admin creates class and subjects`);
    console.log(`   2. Prep Admin assigns teachers to specific subjects`);
    console.log(`   3. Teachers create content only for their assigned subjects`);
    console.log(`   4. Prep Admin maintains oversight of all content`);
}

main()
    .catch((e) => {
        console.error("❌ Error during seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });