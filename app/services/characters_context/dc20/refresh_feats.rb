# frozen_string_literal: true

module CharactersContext
  module Dc20
    class RefreshFeats < CharactersContext::RefreshFeats
      REQUIRED_ATTRIBUTES = %i[id slug conditions origin origin_value limit_refresh exclude].freeze

      private

      def remove_redundant_feats(...); end

      def exclude_origins_from_remove
        ::Dc20::Feat::SELECTABLE_ORIGINS
      end

      def filter_available_feats(character)
        feats(character).select(*REQUIRED_ATTRIBUTES).filter_map do |item|
          next item if item.conditions.blank?

          filter_feat(item, character)
        end
      end

      def filter_feat(item, character)
        conditions = item.conditions
        return unless match_by_level?(conditions['level'], character)

        item
      end

      def match_by_level?(condition, character)
        return true unless condition
        return false if character.data.level < condition

        true
      end

      def feats(character)
        data = character.data
        ::Dc20::Feat.where(
          origin_value: [data.main_class, data.subclass, character.id].flatten.compact.uniq
        )
      end
    end
  end
end
