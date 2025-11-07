# frozen_string_literal: true

module Dc20
  class Feat < Feat
    ANCESTRY_ORIGIN = 'ancestry'
    CLASS_ORIGIN = 'class'
    CLASS_FLAVOR_ORIGIN = 'class_flavor'

    STATIC = 'static' # рендерится текст
    UPDATE_RESULT = 'update_result' # не рендерится, обновляются данные декоратора

    SHORT_REST = 'short_rest'
    LONG_REST = 'long_rest'
    COMBAT = 'combat'

    enum :origin, {
      ANCESTRY_ORIGIN => 0,
      CLASS_ORIGIN => 1,
      CLASS_FLAVOR_ORIGIN => 2
    }
    enum :kind, { STATIC => 0, UPDATE_RESULT => 1 }
    enum :limit_refresh, { SHORT_REST => 0, LONG_REST => 1, COMBAT => 2 }
  end
end
