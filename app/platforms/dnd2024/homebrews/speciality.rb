# frozen_string_literal: true

module Dnd2024
  module Homebrews
    class SpecialityData
      include StoreModel::Model

      attribute :hit_dice, :integer, default: 6
      attribute :weapon_core_skills, array: true, default: [] # light/martial
      attribute :armor_proficiency, array: true, default: [] # light/medium/heavy/shield
      attribute :skill_boosts, :integer, default: 0
      attribute :any_skill_boosts, :integer, default: 0
      attribute :skill_boosts_list, array: true, default: []
      attribute :class_saves, array: true, default: []
      attribute :multiclass_spell_level, :integer, default: 0 # 0/1/2/3
      attribute :spell_ability, :string # str/dex/con/int/wis/cha
      attribute :cantrips, array: true, default: {}
      attribute :prepared_spells, array: true, default: {}
      attribute :spell_slots, array: true, default: {}
      attribute :spells, array: true, default: []
      attribute :learn_spells, :boolean, default: false
    end

    class Speciality < ::Homebrew
      attribute :info, Dnd2024::Homebrews::SpecialityData.to_type

      def to_homebrew_json(with_id: true)
        [
          info.attributes.symbolize_keys.merge({
            id: with_id ? id : nil,
            title: title,
            description: description,
            public: attributes['public'],
            features: Dnd2024::Feat.where(origin: 'class', origin_value: id).map { |item|
              item.to_homebrew_json(with_id: with_id)
            }
          }).compact
        ]
      end
    end
  end
end
