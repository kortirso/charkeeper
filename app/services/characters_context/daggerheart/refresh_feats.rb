# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class RefreshFeats < CharactersContext::RefreshFeats
      REQUIRED_ATTRIBUTES = %i[id slug conditions origin origin_value limit_refresh exclude].freeze

      private

      def filter_available_feats(character)
        feats(character).select(*REQUIRED_ATTRIBUTES).filter_map do |item|
          next item if item.conditions.blank?

          filter_feat(item, character)
        end
      end

      def filter_feat(item, character)
        conditions = item.conditions
        return unless match_by_subclass_mastery?(conditions['subclass_mastery'], item, character)

        item
      end

      def match_by_subclass_mastery?(condition, item, character)
        return true unless condition
        return true unless item.origin == 'subclass'

        character.data.subclasses_mastery[item.origin_value] > condition
      end

      def feats(character)
        data = character.data
        ::Daggerheart::Feat.where(
          origin_value: [
            data.heritage, data.community, data.classes.keys, data.subclasses.values, data.beastform
          ].flatten.compact.uniq
        ).or(::Daggerheart::Feat.where(origin: 'ancestry', slug: data.heritage_features))
      end
    end
  end
end
