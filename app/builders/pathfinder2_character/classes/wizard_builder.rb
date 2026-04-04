# frozen_string_literal: true

module Pathfinder2Character
  module Classes
    class WizardBuilder
      def call(result:)
        result[:abilities].merge!({ int: 2 }) { |_, oldval, newval| oldval + newval }
        result[:skill_boosts].merge!({ arcana: 1, free: 2 }) { |_, oldval, newval| oldval + newval }

        result[:weapon_skills] = { unarmed: 1, simple: 1, martial: 0, advanced: 0 }
        result[:armor_skills] = { unarmored: 1, light: 0, medium: 0, heavy: 0 }
        result[:saving_throws] = { fortitude: 1, reflex: 1, will: 2 }
        result[:perception] = 1
        result[:class_dc] = 1
        result[:spell_dc] = 1
        result[:spell_attack] = 1
        result[:spell_list] = 'arcane'
        result[:main_ability] = 'int'

        result
      end
    end
  end
end
