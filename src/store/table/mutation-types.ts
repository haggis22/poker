export const NAMESPACE = 'table/';

export const TABLE_SUMMARIES = NAMESPACE + 'table summaries';
export const USER_SUMMARY = NAMESPACE + 'user summary';


export function innerName(mutationType: string): string {

    return mutationType.replace(NAMESPACE, '');

}
