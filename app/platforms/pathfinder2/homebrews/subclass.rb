# frozen_string_literal: true

module Pathfinder2
  module Homebrews
    class SubclassData
      include StoreModel::Model

      attribute :class_id, :string
      attribute :skill_boosts, array: true, default: {}
      attribute :spell_list, :string
      attribute :spells, array: true, default: []
      attribute :focus_spells, array: true, default: []
      attribute :feats, array: true, default: []
    end

    class Subclass < ::Homebrew
      attribute :info, Pathfinder2::Homebrews::SubclassData.to_type

      def to_homebrew_json(with_id: true)
        [
          info.attributes.symbolize_keys.merge({
            id: with_id ? id : nil,
            title: title,
            description: description,
            public: attributes['public'],
            features: Pathfinder2::Feat.where(origin: %w[subclass static_subclass], origin_value: id).map { |item|
              item.to_homebrew_json(with_id: with_id)
            }
          }).compact
        ]
      end
    end
  end
end
