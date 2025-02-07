import { compose } from '@ngrx/store';

import { EffectConfig, EffectMetadata, EffectPropertyKey } from './models';
import { getSourceForInstance } from './utils';

const METADATA_KEY = '__@ngrx/effects__';

export function Effect({
  dispatch = true,
  resubscribeOnError = true,
}: EffectConfig = {}) {
  return function<T extends Object, K extends EffectPropertyKey<T>>(
    target: T,
    propertyName: K
  ) {
    // Right now both createEffect and @Effect decorator set default values.
    // Ideally that should only be done in one place that aggregates that info,
    // for example in mergeEffects().
    const metadata: EffectMetadata<T> = {
      propertyName,
      dispatch,
      resubscribeOnError,
    };
    setEffectMetadataEntries<T>(target, [metadata]);
  };
}

export function getEffectDecoratorMetadata<T>(
  instance: T
): EffectMetadata<T>[] {
  const effectsDecorators: EffectMetadata<T>[] = compose(
    getEffectMetadataEntries,
    getSourceForInstance
  )(instance);

  return effectsDecorators;
}

function setEffectMetadataEntries<T extends object>(
  sourceProto: T,
  entries: EffectMetadata<T>[]
) {
  const constructor = sourceProto.constructor;
  const meta: Array<EffectMetadata<T>> = constructor.hasOwnProperty(
    METADATA_KEY
  )
    ? (constructor as any)[METADATA_KEY]
    : Object.defineProperty(constructor, METADATA_KEY, { value: [] })[
        METADATA_KEY
      ];
  Array.prototype.push.apply(meta, entries);
}

function getEffectMetadataEntries<T extends object>(
  sourceProto: T
): EffectMetadata<T>[] {
  return sourceProto.constructor.hasOwnProperty(METADATA_KEY)
    ? (sourceProto.constructor as typeof sourceProto.constructor & {
        [METADATA_KEY]: EffectMetadata<T>[];
      })[METADATA_KEY]
    : [];
}
