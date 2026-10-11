# frozen_string_literal: true

module Pathfinder2Character
  module Classes
    class CustomBuilder
      def call(result:) # rubocop: disable Metrics/AbcSize
        record = Pathfinder2::Homebrews::Speciality.find_by(id: result[:main_class])
        return result unless record

        info = record.info.attributes.symbolize_keys

        result[:main_ability] = info[:main_abilities].first unless result[:main_ability]
        result[:abilities].merge!({ result[:main_ability].to_sym => 2 }) { |_, oldval, newval| oldval + newval }
        result[:skill_boosts].merge!(info[:skill_boosts]) { |_, oldval, newval| oldval + newval }

        result[:weapon_skills] = info[:weapon_skills].transform_values { |item| item['1'] }
        result[:armor_skills] = info[:armor_skills].transform_values { |item| item['1'] }
        result[:saving_throws] = info[:saving_throws].transform_values { |item| item['1'] }
        result[:perception] = info.dig(:perception, '1')
        result[:class_dc] = info.dig(:class_dc, '1')
        result[:spell_dc] = info.dig(:spell_dc, '1')
        result[:spell_attack] = info.dig(:spell_attack, '1')
        result[:spell_list] = info[:spell_list]
        result[:feats] = result[:feats].push(*info[:feats]).uniq

        result
      end
    end
  end
end
