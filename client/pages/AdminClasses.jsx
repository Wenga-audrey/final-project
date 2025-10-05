import { useEffect, useMemo, useState } from "react";
import { api } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * @typedef {Object} AdminCourse
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} examType
 * @property {string} level
 * @property {number} duration
 * @property {number} [price]
 * @property {boolean} isPublished
 * @property {Array<{ id: string; name: string; description?: string | null }>} [subjects]
 * @property {Array<{
 *   id: string;
 *   userId: string;
 *   user: {
 *     id: string;
 *     firstName: string;
 *     lastName: string;
 *     email: string;
 *     role: string;
 *   };
 * }>} [teachers]
 */

/**
 * @typedef {Object} PaginatedCourses
 * @property {AdminCourse[]} courses
 * @property {Object} pagination
 * @property {number} pagination.page
 * @property {number} pagination.limit
 * @property {number} pagination.total
 * @property {number} pagination.pages
 */

/**
 * @typedef {Object} UserLite
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} role
 */

export default function AdminClasses() {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    examType: "",
    level: "BEGINNER",
    duration: 60,
    price: "",
    isPublished: true,
    subjectsText: "", // one subject per line
  });

  const fetchCourses = async () => {
    const res = await api.get("/api/admin/courses?limit=50");
    if (res.success && res.data?.courses) setCourses(res.data.courses);
  };

  const fetchInstructors = async () => {
    const res = await api.get(
      "/api/admin/users?role=INSTRUCTOR&limit=200",
    );
    if (res.success && Array.isArray(res.data?.users)) {
      setInstructors(
        res.data.users.map((u) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: u.role,
        })),
      );
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const subjects = form.subjectsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name }));

      const payload = {
        title: form.title,
        description: form.description,
        examType: form.examType,
        level: form.level,
        duration: Number(form.duration),
        price: form.price ? Number(form.price) : undefined,
        isPublished: form.isPublished,
        subjects: subjects.length ? subjects : undefined,
      };
      const res = await api.post("/api/admin/classes", payload);
      if (res.success) {
        setForm({
          title: "",
          description: "",
          examType: "",
          level: "BEGINNER",
          duration: 60,
          price: "",
          isPublished: true,
          subjectsText: "",
        });
        await fetchCourses();
      } else {
        alert(res.error || "Failed to create class");
      }
    } finally {
      setLoading(false);
    }
  };

  const onAddSubjects = async (courseId, subjectsText) => {
    const subjects = subjectsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name }));
    if (!subjects.length) return;
    const res = await api.post(`/api/admin/classes/${courseId}/subjects`, {
      subjects,
    });
    if (res.success) await fetchCourses();
    else alert(res.error || "Failed to add subjects");
  };

  const onAssignInstructor = async (courseId, instructorId) => {
    if (!instructorId) return;
    const res = await api.post(
      `/api/admin/classes/${courseId}/assign-instructor`,
      { instructorId },
    );
    if (res.success) await fetchCourses();
    else alert(res.error || "Failed to assign instructor");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-black text-mindboost-dark-green mb-2">Manage Preparatory Classes</h1>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <h2 className="text-xl font-bold">Create New Class</h2>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={onCreate}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="text-sm font-semibold">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Exam Type</label>
                <Input
                  value={form.examType}
                  onChange={(e) =>
                    setForm({ ...form, examType: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Level</label>
                <Select
                  value={form.level}
                  onValueChange={(v) => setForm({ ...form, level: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">BEGINNER</SelectItem>
                    <SelectItem value="INTERMEDIATE">INTERMEDIATE</SelectItem>
                    <SelectItem value="ADVANCED">ADVANCED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold">
                  Duration (hours)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold">
                  Price (optional)
                </label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold">
                  Subjects (one per line)
                </label>
                <Textarea
                  value={form.subjectsText}
                  onChange={(e) =>
                    setForm({ ...form, subjectsText: e.target.value })
                  }
                  placeholder="Mathematics\nLogic\nGeneral Knowledge"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Class"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          {courses.map((c) => (
            <Card key={c.id} className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{c.title}</h3>
                    <p className="text-sm text-gray-600">
                      {c.examType} • {c.level} • {c.duration}h
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {c.isPublished ? "Published" : "Draft"}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Subjects</h4>
                  <ul className="list-disc ml-6 text-sm">
                    {(c.subjects || []).map((s) => (
                      <li key={s.id}>{s.name}</li>
                    ))}
                  </ul>
                  <AddSubjects onAdd={(text) => onAddSubjects(c.id, text)} />
                </div>

                <div>
                  <h4 className="font-semibold">Instructors</h4>
                  <ul className="list-disc ml-6 text-sm">
                    {(c.teachers || []).map((t) => (
                      <li key={t.id}>
                        {t.user.firstName} {t.user.lastName} — {t.user.email}
                      </li>
                    ))}
                  </ul>
                  <AssignInstructor
                    instructors={instructors}
                    onAssign={(userId) => onAssignInstructor(c.id, userId)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddSubjects({ onAdd }) {
  const [text, setText] = useState("");
  return (
    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
      <Textarea
        placeholder="Add subjects (one per line)"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-start md:justify-end">
        <Button
          type="button"
          onClick={() => {
            onAdd(text);
            setText("");
          }}
        >
          Add Subjects
        </Button>
      </div>
    </div>
  );
}

function AssignInstructor({
  instructors,
  onAssign,
}) {
  const [selected, setSelected] = useState("");
  const items = useMemo(() => instructors, [instructors]);
  return (
    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
      <Select value={selected} onValueChange={(v) => setSelected(v)}>
        <SelectTrigger>
          <SelectValue placeholder="Select instructor" />
        </SelectTrigger>
        <SelectContent>
          {items.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.firstName} {u.lastName} — {u.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-start md:justify-end">
        <Button
          type="button"
          onClick={() => {
            if (selected) onAssign(selected);
          }}
        >
          Assign
        </Button>
      </div>
    </div>
  );
}