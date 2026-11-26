/**
 * Orders a mutation event's `adds` so rrweb's player can apply
 * them in one pass.
 *
 * The player inserts an added node only once its parent and
 * its next sibling (`nextId`) exist; anything else goes to a
 * retry queue. rrweb's recorder lists moved siblings so that
 * each one names the following entry as its next sibling, the
 * opposite of what the player needs. A keyed re-sort of a long
 * list therefore becomes one long retry chain, the player
 * gives up after 500 ms ("Timeout in the loop"), and the rest
 * of the rows are silently missing from the replay. With
 * rrweb 2.1.1's player, re-sorting 1,500 table rows lost about
 * two thirds of them, and a second re-sort lost all of them.
 *
 * Placing every add after the adds it depends on removes the
 * queue entirely. The output holds the same entries; only
 * their order changes, and entries with no dependency in the
 * batch keep their original relative order.
 */
interface AddLike {
    parentId: number;
    nextId?: number | null;
    node: {
        id: number;
    };
}
export declare function orderAdds<T extends AddLike>(adds: T[]): T[];
export {};
