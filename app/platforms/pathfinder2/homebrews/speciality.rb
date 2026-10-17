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
      attribute :selected_features, array: true, default: {}
      attribute :subclass_title, array: true, default: {}

      attribute :spells_available, :boolean, default: false
      attribute :only_focus_spells, :boolean, default: false

      # none - заклинания не учатся
      # wizard - заклинания учатся как волшебником, (level * 2) + 3
      # bard - заклинания учатся как бардом, spells_slots.values.sum, по кол-ву ячеек
      enum :spells_amount, %i[none wizard bard], default: :none
      attribute :cantrips_amount, :integer # значение есть, если заклинания учатся

      attribute :cantrip_slots, :integer # значение есть, если заклинания подготавливаются
      attribute :additional_slots, :integer, default: 0 # дополнительные ячейки заклинаний
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
