# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class CustomBuilder
      def call(result:) # rubocop: disable Metrics/AbcSize
        record = Dnd2024::Homebrews::Speciality.find_by(id: result[:main_class])
        return result unless record

        result[:hit_dice][record.info.hit_dice] = 1
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(record.info.weapon_core_skills).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(record.info.armor_proficiency).uniq
        result[:skill_boosts] += record.info.skill_boosts
        result[:any_skill_boosts] += record.info.any_skill_boosts
        result[:skill_boosts_list] = record.info.skill_boosts_list

        result[:abilities] = { str: 15, dex: 14, con: 13, int: 8, wis: 10, cha: 12 }
        result[:health] = { current: 11, max: 11, temp: 0 }

        result
      end
    end
  end
end
