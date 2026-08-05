# frozen_string_literal: true

module Nimble
  class Feat < Feat
    ANCESTRY_ORIGIN = 'ancestry'
    CLASS_ORIGIN = 'class'
    SUBCLASS_ORIGIN = 'subclass'
    SPELL_ORIGIN = 'spell'
    UTILITY_SPELL_ORIGIN = 'utility_spell'

    STATIC = 'static' # рендерится текст
    UPDATE_RESULT = 'update_result' # рендерится, но затемняется
    HIDDEN = 'hidden'
    ONE_FROM_LIST = 'one_from_list' # рендерится список, выбирается одно значение
    MANY_FROM_LIST = 'many_from_list' # рендерится список, выбирается несколько значений
    TEXT = 'text' # может вводиться текст

    COMBAT_REST = 'combat_rest'
    FIELD_REST = 'field_rest'
    LONG_FIELD_REST = 'long_field_rest'
    SAFE_REST = 'safe_rest'

    SELECTABLE_ORIGINS = [3].freeze

    enum :origin, {
      ANCESTRY_ORIGIN => 0,
      CLASS_ORIGIN => 1,
      SUBCLASS_ORIGIN => 2,
      SPELL_ORIGIN => 3,
      UTILITY_SPELL_ORIGIN => 4
    }
    enum :kind, { STATIC => 0, UPDATE_RESULT => 1, HIDDEN => 2, ONE_FROM_LIST => 3, MANY_FROM_LIST => 4, TEXT => 5 }
    enum :limit_refresh, { COMBAT_REST => 0, FIELD_REST => 1, LONG_FIELD_REST => 2, SAFE_REST => 3 }
  end
end
