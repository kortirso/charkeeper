# frozen_string_literal: true

module Daggerheart
  module Homebrews
    class DomainData
      include StoreModel::Model

      attribute :domain_id, :string
    end

    class Domain < ::Homebrew
      attribute :info, Daggerheart::Homebrews::DomainData.to_type

      def to_homebrew_json(with_id: true)
        [
          {
            id: with_id ? id : nil,
            title: title,
            description: description,
            public: attributes['public'],
            domain_id: info.domain_id,
            features: Daggerheart::Feat.where(origin: 'domain_card', origin_value: id).map { |item|
              item.to_homebrew_json(with_id: with_id)
            }
          }.compact
        ]
      end
    end
  end
end
