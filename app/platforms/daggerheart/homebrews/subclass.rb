# frozen_string_literal: true

module Daggerheart
  module Homebrews
    class SubclassData
      include StoreModel::Model

      attribute :class_id, :string
      attribute :spellcast, :string
      attribute :mechanics, array: true, default: [] # beastform, companion
    end

    class Subclass < ::Homebrew
      attribute :info, Daggerheart::Homebrews::SubclassData.to_type

      def to_homebrew_json(with_id: true)
        [
          {
            id: with_id ? id : nil,
            title: title,
            description: description,
            public: attributes['public'],
            class_id: info.class_id,
            spellcast: info.spellcast,
            mechanics: info.mechanics,
            features: Daggerheart::Feat.where(origin_value: id).map { |item|
              item.to_homebrew_json(with_id: with_id)
            }
          }.compact
        ]
      end
    end
  end
end
