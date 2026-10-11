# frozen_string_literal: true

module Pathfinder2
  module Homebrews
    class SpecialityData
      include StoreModel::Model

      attribute :class_hp, :integer
      attribute :main_abilities, array: true, default: []
      attribute :skill_boosts, array: true, default: {}
      attribute :perception, array: true, default: {}
      attribute :class_dc, array: true, default: {}
      attribute :spell_dc, array: true, default: {}
      attribute :spell_attack, array: true, default: {}
      attribute :spell_list, :string
      attribute :saving_throws, array: true, default: {}
      attribute :weapon_skills, array: true, default: {}
      attribute :armor_skills, array: true, default: {}
      attribute :feats, array: true, default: []
    end

    class Speciality < ::Homebrew
      attribute :info, Pathfinder2::Homebrews::SpecialityData.to_type

      def to_homebrew_json(with_id: true)
        [
          info.attributes.symbolize_keys({
            id: with_id ? id : nil,
            title: title,
            description: description,
            public: attributes['public']
          }).compact
        ]
      end
    end
  end
end
