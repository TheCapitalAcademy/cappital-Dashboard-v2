import React from 'react'
import Chapter from '../../components/chapter/Chapter'
import { numsBioChapters, numsPhysicsChapters, numsEnglishChapters, numsChemistryChapters } from '../../../utils/chaperts';
import { mdcatBioChapters, mdcatChemistryChapters, mdcatPhysicsChapters, mdcatEnglishChapters, mdcatLogicChapter } from '../../../utils/chaperts';
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useEffect } from 'react'
import '../subjects/subjectpage.scss'
import { useSelector } from 'react-redux';
import axiosInstance from '../../../baseUrl';

// Build a flat name→image map from all existing static chapter arrays.
// Keys are lowercase trimmed so matching is reliable.
const _allArrays = [
    numsBioChapters, numsChemistryChapters, numsPhysicsChapters, numsEnglishChapters,
    mdcatBioChapters, mdcatChemistryChapters, mdcatPhysicsChapters, mdcatEnglishChapters, mdcatLogicChapter,
];
const CHAPTER_IMG_MAP = {};
_allArrays.forEach(arr => {
    if (Array.isArray(arr)) {
        arr.forEach(ch => {
            if (ch?.name) CHAPTER_IMG_MAP[ch.name.toLowerCase().trim()] = ch.image;
        });
    }
});
// Fallback image for chapters not in the static map
const DEFAULT_CHAPTER_IMG = numsBioChapters[0]?.image;

const Chapters = () => {
    const subjectParam = useParams()?.subject.trim();
    const chapterParam = useParams()?.chapter.trim();

    const [user, setUser] = useState(useSelector((state) => state.auth?.user?.user?.user));
    const isMdcat = user?.isMdcat || false;
    const isNums = user?.isNums || false;
    const isMdcatNums = user?.isMdcatNums || false;
    const isTrial = user?.isTrialActive || false;
    const trialStatus=isTrial && !isMdcat && !isNums && !isMdcatNums;

    const [selectTopic, selectSelectedTopic] = useState([]);

    useEffect(() => {
        if (!subjectParam || !chapterParam) return;
        if (!['nums', 'mdcat'].includes(subjectParam)) return;

        axiosInstance
            .get(`/course-structure/${subjectParam}/subjects/${encodeURIComponent(chapterParam)}/chapters`)
            .then(res => {
                const chapters = res.data.map((name, idx) => ({
                    id: idx + 1,
                    name: name.toUpperCase(),
                    image: CHAPTER_IMG_MAP[name.toLowerCase().trim()] || DEFAULT_CHAPTER_IMG,
                }));
                selectSelectedTopic(chapters);
            })
            .catch(() => {
                // Fallback to static data on API failure
                const fallback = {
                    nums: { biology: numsBioChapters, chemistry: numsChemistryChapters, physics: numsPhysicsChapters, english: numsEnglishChapters },
                    mdcat: { biology: mdcatBioChapters, chemistry: mdcatChemistryChapters, physics: mdcatPhysicsChapters, english: mdcatEnglishChapters, logic: mdcatLogicChapter },
                };
                const arr = fallback[subjectParam]?.[chapterParam] || [];
                selectSelectedTopic(arr);
            });
    }, [subjectParam, chapterParam])


    return (
        <>
            <div className="container">
                <div className="row">
                    <div className="col-md-8 col-12 offset-md-2 text-center">
                        <h1 className="subjectpage-heading p-3 fw-bold text-white rounded-5 mb-5">SELECT YOUR CHAPTER</h1>
                    </div>
                </div>
                <div className="row">
                    {selectTopic.map((ele, index) => (
                        <Chapter key={index} name={ele.name} img={ele.image} isLocked={trialStatus && index > 0} />
                    ))}
                </div>
            </div>
        </>
    )
}

export default Chapters