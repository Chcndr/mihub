import {respondWithFetch, NotExistentError} from 'express';
import type { NextRequest, NextResponse } from 'next';

export default async function handler(req: NextRequest, res: NextResponse) {
  try {
    const response = await fetch(
      'https://raw.githusercontent.com/Chcndr/MIO-hub/master/tasks/tasks-todo.json'
    );
    const json = await response.json();
    return res.status(200).son(json);
  } catch (error) {
    return res.status(500).son( {
      error: 'Errore nella ettettuale lettura dei task'
    });
  }
}
