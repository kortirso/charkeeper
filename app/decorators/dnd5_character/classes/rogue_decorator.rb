# frozen_string_literal: true

module Dnd5Character
  module Classes
    class RogueDecorator < ApplicationDecorator
      CLASS_SAVE_DC = %w[dex int].freeze
      EXTENDED_CLASS_SAVE_DC = %w[dex int wis].freeze

      def class_save_dc
        @class_save_dc ||=
          if main_class == 'rogue'
            class_level >= 15 ? EXTENDED_CLASS_SAVE_DC : CLASS_SAVE_DC
          else
            __getobj__.class_save_dc
          end
      end

      private

      def class_level
        @class_level ||= classes['rogue']
      end
    end
  end
end
