const express = require('express');
const router = express.Router();
const CourseStructure = require('../models/courseStructure');
const wrapAsync = require('../utils/wrapAsync');

// ============================================================
// Seed data – mirrors the existing hardcoded frontend lists
// ============================================================
const SEED_DATA = {
    mdcat: {
        biology: [
            'cell & organelles','biological molecules','enzymes','bioenergetics',
            'acellular life','prokaryotes','kingdom animalia','life process in plants',
            'digestion','circulation','immunity','respiration',
            'support & movement','nervous coordination','chemical coordination',
            'behavior','reproduction','development & aging','inheritance',
            'chromosome & dna','evolution',
        ],
        chemistry: [
            'fundamentals of chemistry','atomic structure','chemical bonding','gases',
            'liquids','solids','chemical equilibrium','acids, bases & salts',
            'chemical kinetics','thermochemistry','electrochemistry','s & p block elements',
            'transition elements','organic chemistry','hydrocarbons','alkyl halides',
            'alcohols, phenols & ethers','aldehydes & ketones','carboxylic acids','biochemistry',
        ],
        physics: [
            'force & motion','work & energy','rotational motion','oscillations',
            'waves','thermodynamics','electrostatics','current electricity',
            'electromagnetism','electromagnetic induction','electronics',
            'dawn of modern physics','atomic spectra','nuclear physics',
        ],
        english: [
            'noun','pronoun','verb','adverb','adjective','preposition',
            'conjunction','interjection','agreement mistakes','combination mistakes',
            'redundancy','punctuation','diction mistakes','tenses','articles',
            'active & passive voice','narration','vocabulary',
        ],
        logic: [
            'number & letter series','logical problems','logical deduction',
            'course of action','cause & effect','critical thinking',
        ],
    },
    nums: {
        biology: [
            'cell & organelles','biological molecules','enzymes','bioenergetics',
            'acellular life','prokaryotes','kingdom animalia','life process in plants',
            'digestion','circulation','immunity','respiration','homeostasis',
            'support & movement','nervous coordination','chemical coordination',
            'behavior','reproduction','development & aging','inheritance',
            'chromosome & dna','evolution',
        ],
        chemistry: [
            'fundamentals of chemistry','atomic structure','chemical bonding','gases',
            'liquids','solids','chemical equilibrium','acids, bases & salts',
            'chemical kinetics','thermochemistry','electrochemistry','s & p block elements',
            'transition elements','organic chemistry','hydrocarbons','alkyl halides',
            'alcohols, phenols & ethers','aldehydes & ketones','carboxylic acids','biochemistry',
        ],
        physics: [
            'force & motion','work & energy','rotational motion','oscillations',
            'waves','thermodynamics','electrostatics','current electricity',
            'electromagnetism','electromagnetic induction','electronics',
            'dawn of modern physics','atomic spectra','nuclear physics',
        ],
        english: [
            'noun','pronoun','verb','adverb','adjective','preposition',
            'conjunction','interjection','agreement mistakes','combination mistakes',
            'redundancy','punctuation','diction mistakes','tenses','articles',
            'active & passive voice','narration','vocabulary',
        ],
    },
};

// Auto-seed a course if it has no document yet
async function ensureSeeded(course) {
    let doc = await CourseStructure.findOne({ course });
    if (!doc) {
        try {
            const subjectData = SEED_DATA[course] || {};
            const subjects = Object.entries(subjectData).map(([name, chapters], sIdx) => ({
                name,
                order: sIdx,
                chapters: chapters.map((c, cIdx) => ({ name: c, order: cIdx })),
            }));
            doc = await CourseStructure.create({ course, subjects });
        } catch (err) {
            // Another concurrent request already inserted it — just fetch it
            if (err.code === 11000) {
                doc = await CourseStructure.findOne({ course });
            } else {
                throw err;
            }
        }
    }
    return doc;
}

const VALID_COURSES = ['mdcat', 'nums'];

// ------------------------------------------------------------------
// GET  /course-structure/:course  – full structure (auto-seeds)
// ------------------------------------------------------------------
router.get('/:course', wrapAsync(async (req, res) => {
    const { course } = req.params;
    if (!VALID_COURSES.includes(course))
        return res.status(400).json({ message: 'Invalid course' });
    const doc = await ensureSeeded(course);
    res.json(doc);
}));

// ------------------------------------------------------------------
// GET  /course-structure/:course/subjects
// ------------------------------------------------------------------
router.get('/:course/subjects', wrapAsync(async (req, res) => {
    const { course } = req.params;
    if (!VALID_COURSES.includes(course))
        return res.status(400).json({ message: 'Invalid course' });
    const doc = await ensureSeeded(course);
    res.json(doc.subjects.map(s => s.name));
}));

// ------------------------------------------------------------------
// POST /course-structure/:course/subjects  { name }
// ------------------------------------------------------------------
router.post('/:course/subjects', wrapAsync(async (req, res) => {
    const { course } = req.params;
    if (!VALID_COURSES.includes(course))
        return res.status(400).json({ message: 'Invalid course' });
    const { name } = req.body;
    if (!name || !name.trim())
        return res.status(400).json({ message: 'name is required' });
    const normalized = name.toLowerCase().trim();
    const doc = await ensureSeeded(course);
    if (doc.subjects.find(s => s.name === normalized))
        return res.status(409).json({ message: 'Subject already exists' });
    doc.subjects.push({ name: normalized, order: doc.subjects.length, chapters: [] });
    await doc.save();
    res.json({ message: `Subject "${normalized}" added`, subjects: doc.subjects.map(s => s.name) });
}));

// ------------------------------------------------------------------
// DELETE /course-structure/:course/subjects/:subjectName
// ------------------------------------------------------------------
router.delete('/:course/subjects/:subjectName', wrapAsync(async (req, res) => {
    const { course, subjectName } = req.params;
    if (!VALID_COURSES.includes(course))
        return res.status(400).json({ message: 'Invalid course' });
    const doc = await CourseStructure.findOne({ course });
    if (!doc) return res.status(404).json({ message: 'Course not found' });
    doc.subjects = doc.subjects.filter(s => s.name !== subjectName.toLowerCase());
    await doc.save();
    res.json({ message: 'Subject removed', subjects: doc.subjects.map(s => s.name) });
}));

// ------------------------------------------------------------------
// GET  /course-structure/:course/subjects/:subjectName/chapters
// ------------------------------------------------------------------
router.get('/:course/subjects/:subjectName/chapters', wrapAsync(async (req, res) => {
    const { course, subjectName } = req.params;
    if (!VALID_COURSES.includes(course))
        return res.status(400).json({ message: 'Invalid course' });
    const doc = await ensureSeeded(course);
    const subject = doc.subjects.find(s => s.name === subjectName.toLowerCase());
    if (!subject) return res.json([]);
    res.json(subject.chapters.map(c => c.name));
}));

// ------------------------------------------------------------------
// POST /course-structure/:course/subjects/:subjectName/chapters  { name }
// ------------------------------------------------------------------
router.post('/:course/subjects/:subjectName/chapters', wrapAsync(async (req, res) => {
    const { course, subjectName } = req.params;
    if (!VALID_COURSES.includes(course))
        return res.status(400).json({ message: 'Invalid course' });
    const { name } = req.body;
    if (!name || !name.trim())
        return res.status(400).json({ message: 'name is required' });
    const normalized = name.toLowerCase().trim();
    const doc = await ensureSeeded(course);
    const subject = doc.subjects.find(s => s.name === subjectName.toLowerCase());
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (subject.chapters.find(c => c.name === normalized))
        return res.status(409).json({ message: 'Chapter already exists' });
    subject.chapters.push({ name: normalized, order: subject.chapters.length });
    await doc.save();
    res.json({ message: `Chapter "${normalized}" added`, chapters: subject.chapters.map(c => c.name) });
}));

// ------------------------------------------------------------------
// DELETE /course-structure/:course/subjects/:subjectName/chapters/:chapterName
// ------------------------------------------------------------------
router.delete('/:course/subjects/:subjectName/chapters/:chapterName', wrapAsync(async (req, res) => {
    const { course, subjectName, chapterName } = req.params;
    if (!VALID_COURSES.includes(course))
        return res.status(400).json({ message: 'Invalid course' });
    const doc = await CourseStructure.findOne({ course });
    if (!doc) return res.status(404).json({ message: 'Course not found' });
    const subject = doc.subjects.find(s => s.name === subjectName.toLowerCase());
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    const normalized = decodeURIComponent(chapterName).toLowerCase();
    subject.chapters = subject.chapters.filter(c => c.name !== normalized);
    await doc.save();
    res.json({ message: 'Chapter removed', chapters: subject.chapters.map(c => c.name) });
}));

module.exports = router;
