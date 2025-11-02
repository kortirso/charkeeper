# frozen_string_literal: true

module Daggerheart
  class Feat < Feat
    ANCESTRY_ORIGIN = 'ancestry'
    COMMUNITY_ORIGIN = 'community'
    CLASS_ORIGIN = 'class'
    SUBCLASS_ORIGIN = 'subclass'
    BEASTFORM_ORIGIN = 'beastform'
    CHARACTER_ORIGIN = 'character'
    TRANSFORMATION_ORIGIN = 'transformation'
    DOMAIN_CARD_ORIGIN = 'domain_card'

    STATIC = 'static' # рендерится текст
    TEXT = 'text' # можно добавить текст
    UPDATE_RESULT = 'update_result' # не рендерится, обновляются данные декоратора
    STATIC_LIST = 'static_list' # рендерится список, выбирается одно значение
    MANY_FROM_LIST = 'many_from_list' # рендерится список, выбирается несколько значений

    SHORT_REST = 'short_rest'
    LONG_REST = 'long_rest'
    SESSION = 'session'

    enum :origin, {
      ANCESTRY_ORIGIN => 0,
      COMMUNITY_ORIGIN => 1,
      CLASS_ORIGIN => 2,
      SUBCLASS_ORIGIN => 3,
      BEASTFORM_ORIGIN => 4,
      CHARACTER_ORIGIN => 5,
      TRANSFORMATION_ORIGIN => 6,
      DOMAIN_CARD_ORIGIN => 7
    }
    enum :kind, { STATIC => 0, TEXT => 1, UPDATE_RESULT => 2, STATIC_LIST => 3, MANY_FROM_LIST => 4 }
    enum :limit_refresh, { SHORT_REST => 0, LONG_REST => 1, SESSION => 2 }
  end
end
