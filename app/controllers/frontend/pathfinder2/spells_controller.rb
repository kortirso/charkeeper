# frozen_string_literal: true

module Frontend
  module Pathfinder2
    class SpellsController < Frontend::BaseController
      include Deps[markdown: 'markdown']
      include SerializeRelation

      before_action :find_spell, only: %i[show]

      def index
        serialize_relation_v2(
          relation, ::Pathfinder2::SpellSerializer, :spells, cache_options: cache_options, order_options: { key: 'title' }
        )
      end

      def show
        render json: { description: markdown.call(value: @spell.description[I18n.locale.to_s], version: '0.4.5') }
      end

      private

      def find_spell
        @spell = ::Pathfinder2::Feat.where(origin: 4).find(params.expect(:id))
      end

      def cache_options
        return {} if params[:homebrew]

        { key: ["spells/pathfinder2/#{I18n.locale}/v0.5.14", params[:max_level]].compact.join('/'), expires_in: 12.hours }
      end

      def relation
        result = ::Pathfinder2::Feat.where(origin: 4)
        result.where("info ->> 'level' IN (?)", (0..params[:max_level].to_i).to_a.map(&:to_s)) if params[:max_level]

        if params[:homebrew]
          result.where(user_id: current_user.id).or(result.where(id: homebrew_item_ids))
        else
          result.where(user_id: nil)
        end
      end

      def homebrew_item_ids
        ::Homebrew::Book::Item
          .where(homebrew_book_id: ::User::Book.where(user_id: current_user).select(:homebrew_book_id))
          .where(itemable_type: 'Pathfinder2::Feat')
          .pluck(:itemable_id)
      end
    end
  end
end
