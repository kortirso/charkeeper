# frozen_string_literal: true

module Frontend
  module Dnd2024
    class SpellsController < Frontend::BaseController
      include Deps[
        feature_requirement: 'feature_requirement',
        markdown: 'markdown'
      ]
      include SerializeRelation

      before_action :find_spell, only: %i[show]

      def index
        if feature_requirement.call(current: params[:version], initial: '0.5.15')
          render json: { spells: base_json + hb_json }, status: :ok
        else
          serialize_relation_v2(
            relation, ::Dnd2024::SpellSerializer, :spells, cache_options: cache_options, order_options: { key: 'title' }
          )
        end
      end

      def show
        render json: { description: markdown.call(value: @spell.description[I18n.locale.to_s], version: '0.4.5') }
      end

      private

      def base_json
        relation_to_json(
          base_relation.where(user_id: nil), ::Dnd2024::SpellSerializer, cache_options: cache_options
        )
      end

      def hb_json
        result = base_relation
        relation_to_json(
          result.where(user_id: current_user.id).or(result.where(id: homebrew_item_ids)),
          ::Dnd2024::SpellSerializer
        )
      end

      def find_spell
        @spell = ::Dnd2024::Feat.where(origin: 6).find(params.expect(:id))
      end

      def cache_options
        return {} if params[:homebrew]

        { key: ["spells/dnd2024/#{I18n.locale}/v0.5.15", params[:max_level]].compact.join('/'), expires_in: 12.hours }
      end

      def base_relation
        result = ::Dnd2024::Feat.where(origin: 6)
        result = result.where("info ->> 'level' IN (?)", (0..params[:max_level].to_i).to_a.map(&:to_s)) if params[:max_level]
        result
      end

      def relation
        return [] unless feature_requirement.call(current: params[:version], initial: '0.4.5')

        result = base_relation
        if params[:homebrew]
          result.where(user_id: current_user.id).or(result.where(id: homebrew_item_ids))
        else
          result.where(user_id: nil)
        end
      end

      def homebrew_item_ids
        ::Homebrew::Book::Item
          .where(homebrew_book_id: ::User::Book.where(user_id: current_user).select(:homebrew_book_id))
          .where(itemable_type: 'Dnd2024::Feat')
          .pluck(:itemable_id)
      end
    end
  end
end
