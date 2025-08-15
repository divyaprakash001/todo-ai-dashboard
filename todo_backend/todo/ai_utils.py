# my ai_utils.py for getting the ai suggestions

import json, re
from decouple import config
from openai import OpenAI

OPENAI_API_KEY = config("OPENAI_API_KEY", default=None)
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


def _safe_parse_json(text):
    try:
        return json.loads(text)
    except Exception:
        m = re.search(r'(\{.*\}|\[.*\])', text, re.S)
        if m:
            try:
                return json.loads(m.group(1))
            except Exception:
                return None
        return None


def _build_prompt_for_single(task, contexts, user):
    ctx_preview = "\n".join([
        f"- ({c['source_type']}) {c['content']}"
        for c in contexts[:20]
    ])
    prompt = f"""
        You are a task assistant. Given the task and recent user context, return a JSON object only (no prose) with keys:
        priority_score (integer 0-10), deadline (YYYY-MM-DD or null), improved_description (string), suggested_category (string or null).

        Task:
        title: {task.title}
        description: {task.description or ''}

        Recent context (most recent first):
        {ctx_preview}

        Return only JSON. Example:
        {{"priority_score":8,"deadline":"2025-08-15","improved_description":"...","suggested_category":"Work"}}
    """
    return prompt


def _normalize_contexts(context_qs):
    """This ensure contexts are in dict format."""
    return [
        {
            'source_type': getattr(c, 'source_type', None) or c.get('source_type'),
            'content': getattr(c, 'content', None) or c.get('content', '')
        }
        for c in context_qs
    ]


def _normalize_task(task):
    """Convert dict or model into object with .title and .description."""
    class Tmp: pass
    tmp = Tmp()
    tmp.title = getattr(task, 'title', None) or task.get('title')
    tmp.description = getattr(task, 'description', None) or task.get('description', '')
    return tmp


def get_ai_task_suggestions_single(task_obj, context_qs, user):
    contexts = _normalize_contexts(context_qs)
    prompt = _build_prompt_for_single(task_obj, contexts, user)

    if client:
        try:
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=400
            )
            raw = resp.choices[0].message.content
            data = _safe_parse_json(raw)
            return data or {}
        except Exception as e:
            return {"error": str(e)}
    else:
        return {
            "priority_score": 5,
            "deadline": None,
            "improved_description": task_obj.description or task_obj.title,
            "suggested_category": None
        }


def get_ai_task_suggestions_bulk(tasks, contexts, user):
    results = []
    for t in tasks:
        tmp = _normalize_task(t)
        data = get_ai_task_suggestions_single(tmp, contexts, user)
        if data is None:
            data = {}
        # Add id/title for reference
        data['id'] = getattr(t, 'id', None) or t.get('id')
        data['title'] = getattr(t, 'title', None) or t.get('title')
        results.append(data)
    return results
