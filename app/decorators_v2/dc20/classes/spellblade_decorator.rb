# frozen_string_literal: true

module Dc20
  module Classes
    class SpellbladeDecorator < ApplicationDecoratorV2
      def call(result:) # rubocop: disable Metrics/AbcSize
        @result = result
        @result['max_stamina_points'] = ((level + 3) / 4) + paths['martial']
        @result['max_mana_points'] = mana_points_by_level
        @result['maneuver_points'] = class_maneuver_points + paths['martial']
        @result['max_health'] = 6 + level + ((level + 1) / 2) + modified_abilities['mig']
        @result['spells'] = ((level + 3) / 4) + 1
        @result['spell_list'] = []

        @result['spell_class'] = 'spellblade'
        @result['spell_filter'] = spell_filter.slice('schools').merge('tags' => %w[weapon ward])

        @result
      end

      private

      def class_maneuver_points
        return 4 if level >= 10
        return 3 if level >= 7
        return 2 if level >= 3

        1
      end

      def mana_points_by_level
        return 11 if level >= 10
        return 9 if level >= 9
        return 8 if level >= 7
        return 6 if level >= 5
        return 5 if level >= 3

        3
      end
    end
  end
end
