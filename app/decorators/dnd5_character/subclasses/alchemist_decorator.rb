# frozen_string_literal: true

module Dnd5Character
  module Subclasses
    class AlchemistDecorator < ApplicationDecorator
      SPELLS = {
        3 => %w[healing_word ray_of_sickness],
        5 => %w[melf_acid_arrow flaming_sphere],
        9 => %w[gaseous_form mass_healing_word]
      }.freeze

      def static_spells
        @static_spells ||= begin
          result = __getobj__.static_spells
          result.merge!(SPELLS[3].index_with { {} }) if class_level >= 3
          result.merge!(SPELLS[5].index_with { {} }) if class_level >= 5
          result.merge!(SPELLS[9].index_with { {} }) if class_level >= 9
          result
        end
      end

      private

      def class_level
        @class_level ||= classes['artificer']
      end
    end
  end
end
