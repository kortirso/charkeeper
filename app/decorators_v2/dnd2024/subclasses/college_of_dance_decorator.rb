# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class CollegeOfDanceDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['armor_class'] = [armor_class, bard_armor_class].max if no_armor
        @result['attacks'] = with_bardic_damage if no_armor
        @result
      end

      private

      def class_level
        @class_level ||= classes['bard']
      end

      def bard_armor_class
        10 + modifiers['dex'] + modifiers['cha']
      end

      def with_bardic_damage
        @result['attacks'].map do |attack|
          next attack unless attack[:kind] == 'unarmed' && attack[:action_type] == 'action'

          attack[:attack_bonus] = [modifiers['str'], modifiers['dex']].max + proficiency_bonus
          attack[:damage] = bardic_inspiration_dice
          attack
        end
      end

      def bardic_inspiration_dice
        return 'd12' if class_level >= 15
        return 'd10' if class_level >= 10
        return 'd8' if class_level >= 5

        'd6'
      end
    end
  end
end
