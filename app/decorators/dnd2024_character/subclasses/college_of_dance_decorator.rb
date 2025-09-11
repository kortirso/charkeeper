# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class CollegeOfDanceDecorator < ApplicationDecorator
      def armor_class
        @armor_class ||= no_armor ? [__getobj__.armor_class, bard_armor_class].max : __getobj__.armor_class
      end

      def attacks
        @attacks ||= no_armor ? with_bardic_damage : __getobj__.attacks
      end

      private

      def class_level
        @class_level ||= classes['bard']
      end

      def bard_armor_class
        10 + modifiers['dex'] + modifiers['cha']
      end

      def no_armor
        @no_armor ||= defense_gear.values.all?(&:nil?)
      end

      def with_bardic_damage
        result = __getobj__.attacks
        unarmed_attack = result.find { |attack| attack[:kind] == 'unarmed' && attack[:action_type] == 'action' }
        unarmed_attack[:attack_bonus] = [modifiers['str'], modifiers['dex']].max + proficiency_bonus
        unarmed_attack[:damage] = bardic_inspiration_dice
        result
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
