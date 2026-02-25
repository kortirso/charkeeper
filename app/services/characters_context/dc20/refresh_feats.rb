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
        selected_feats = find_selected_feats(character)
        feats(character).select(*REQUIRED_ATTRIBUTES).filter_map do |item|
          next item if item.conditions.blank?

          filter_feat(item, character, selected_feats)
        end
      end

      def filter_feat(item, character, selected_feats)
        conditions = item.conditions
        return unless match_by_level?(conditions['level'], character)
        return unless match_by_selected_feats?(conditions['selected_feature'], selected_feats)

        item
      end

      def match_by_level?(condition, character)
        return true unless condition
        return false if character.data.level < condition

        true
      end

      def match_by_selected_feats?(condition, selected_feats)
        return true unless condition
        return false if ([condition] - selected_feats).any?

        true
      end

      def find_selected_feats(character)
        character.data.selected_features.values.flatten
      end

      def feats(character)
        data = character.data
        ::Dc20::Feat
          .where(origin_value: [data.main_class, data.subclass, character.id].flatten.compact.uniq)
          .where.not(origin: exclude_origins_from_remove)
      end
    end
  end
end
