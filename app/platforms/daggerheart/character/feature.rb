# frozen_string_literal: true

module Daggerheart
  class Character
    class Feature < ApplicationRecord
      self.table_name = :daggerheart_character_features

      ANCESTRY_ORIGIN = 'ancestry'
      COMMUNITY_ORIGIN = 'community'
      CLASS_ORIGIN = 'class'
      SUBCLASS_ORIGIN = 'subclass'

      STATIC = 'static' # рендерится текст

      SHORT_REST = 'short_rest'
      LONG_REST = 'long_rest'
      SESSION = 'session'

      enum :origin, { ANCESTRY_ORIGIN => 0, COMMUNITY_ORIGIN => 1, CLASS_ORIGIN => 2, SUBCLASS_ORIGIN => 3 }
      enum :kind, { STATIC => 0 }
      enum :limit_refresh, { SHORT_REST => 0, LONG_REST => 1, SESSION => 2 }
    end
  end
end
