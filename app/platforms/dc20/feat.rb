# frozen_string_literal: true

module Dc20
  class Feat < Feat
    ANCESTRY_ORIGIN = 'ancestry'
    CLASS_ORIGIN = 'class'
    CLASS_FLAVOR_ORIGIN = 'class_flavor'
    MANEUVER_ORIGIN = 'maneuver'
    TALENT_ORIGIN = 'talent'
    SUBCLASS_ORIGIN = 'subclass'
    SUBCLASS_FLAVOR_ORIGIN = 'subclass_flavor'

    STATIC = 'static' # рендерится текст
    UPDATE_RESULT = 'update_result' # рендерится, но затемняется
    HIDDEN = 'hidden'

    SHORT_REST = 'short_rest'
    LONG_REST = 'long_rest'
    COMBAT = 'combat'

    SELECTABLE_ORIGINS = [0, 3, 4].freeze

    enum :origin, {
      ANCESTRY_ORIGIN => 0,
      CLASS_ORIGIN => 1,
      CLASS_FLAVOR_ORIGIN => 2,
      MANEUVER_ORIGIN => 3,
      TALENT_ORIGIN => 4,
      SUBCLASS_ORIGIN => 5,
      SUBCLASS_FLAVOR_ORIGIN => 6
    }
    enum :kind, { STATIC => 0, UPDATE_RESULT => 1, HIDDEN => 2 }
    enum :limit_refresh, { SHORT_REST => 0, LONG_REST => 1, COMBAT => 2 }
  end
end
