# frozen_string_literal: true

module Dnd2024
  module Homebrews
    class SubclassData
      include StoreModel::Model

      attribute :class_id, :string
    end

    class Subclass < ::Homebrew
      attribute :info, Dnd2024::Homebrews::SubclassData.to_type

      def to_homebrew_json(with_id: true)
        [
          {
            id: with_id ? id : nil,
            title: title,
            description: description,
            public: attributes['public'],
            class_id: info.class_id,
            features: Dnd2024::Feat.where(origin: 'subclass', origin_value: id).map { |item|
              item.to_homebrew_json(with_id: with_id)
            }
          }.compact
        ]
      end
    end
  end
end
