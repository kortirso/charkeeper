# frozen_string_literal: true

module Dnd2024
  class Feat < Feat
    SPECIES_ORIGIN = 'species'
    CLASS_ORIGIN = 'class'
    LEGACY_ORIGIN = 'legacy'
    SUBCLASS_ORIGIN = 'subclass'
    FEAT_ORIGIN = 'feat'

    STATIC = 'static'
    TEXT = 'text'
    UPDATE_RESULT = 'update_result' # не рендерится, обновляются данные декоратора
    ONE_FROM_LIST = 'one_from_list' # рендерится список, выбирается одно значение
    MANY_FROM_LIST = 'many_from_list' # рендерится список, выбирается несколько значений

    SHORT_REST = 'short_rest'
    LONG_REST = 'long_rest'
    ONE_AT_SHORT_REST = 'one_at_short_rest' # 1 заряд восстанавливается при коротком отдыхе

    enum :origin, { SPECIES_ORIGIN => 0, CLASS_ORIGIN => 1, LEGACY_ORIGIN => 2, SUBCLASS_ORIGIN => 3, FEAT_ORIGIN => 4 }
    enum :kind, {
      STATIC => 0, TEXT => 1, UPDATE_RESULT => 2, ONE_FROM_LIST => 3, MANY_FROM_LIST => 4
    }
    enum :limit_refresh, { SHORT_REST => 0, LONG_REST => 1, ONE_AT_SHORT_REST => 2 }
  end
end
