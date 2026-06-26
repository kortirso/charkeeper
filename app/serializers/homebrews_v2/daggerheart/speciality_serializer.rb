# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class SpecialitySerializer < ApplicationSerializer
      attributes :id, :features, :info, :domains

      def domains
        default = ::Daggerheart::Character.domains
        object.info.domains.map do |domain|
          default[domain] ? translate(default.dig(domain, 'name')) : ::Daggerheart::Homebrew::Domain.find_by(id: domain)&.name
        end
      end

      def features
        return [] unless context
        return [] unless context[:features]

        relation = context[:features]
        Panko::ArraySerializer.new(
          relation,
          each_serializer: HomebrewsV2::Daggerheart::FeatSerializer
        ).serialize(relation)
      end
    end
  end
end
