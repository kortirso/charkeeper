# frozen_string_literal: true

module Cosmere
  module Homebrews
    class AncestryData
      include StoreModel::Model

      attribute :only, array: true, default: []
      attribute :attribute_points, :integer
      attribute :initial_talents, array: true, default: []
      attribute :key_talent, :string
    end

    class Ancestry < ::Homebrew
      attribute :info, Cosmere::Homebrews::AncestryData.to_type

      def to_homebrew_json(with_id: true)
        [
          {
            id: with_id ? id : nil,
            title: title,
            description: description,
            only: info.only,
            attribute_points: info.attribute_points,
            initial_talents: info.initial_talents,
            public: attributes['public'],
            features: Cosmere::Feat.where(origin: 'ancestry', origin_value: id).order(created_at: :asc).map { |item|
              item.to_homebrew_json(with_id: with_id)
            }
          }.compact
        ]
      end
    end
  end
end
