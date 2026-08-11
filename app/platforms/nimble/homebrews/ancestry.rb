# frozen_string_literal: true

module Nimble
  module Homebrews
    class AncestryData
      include StoreModel::Model

      attribute :sizes, array: true, default: %w[medium]
    end

    class Ancestry < ::Homebrew
      attribute :info, Nimble::Homebrews::AncestryData.to_type

      def to_homebrew_json(with_id: true)
        [
          {
            id: with_id ? id : nil,
            title: title,
            description: description,
            public: attributes['public'],
            sizes: info.sizes,
            features: Nimble::Feat.where(origin: 'ancestry', origin_value: id).order(created_at: :asc).map { |item|
              item.to_homebrew_json(with_id: with_id)
            }
          }.compact
        ]
      end
    end
  end
end
