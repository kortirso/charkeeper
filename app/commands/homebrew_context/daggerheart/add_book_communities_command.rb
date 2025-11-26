# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddBookCommunitiesCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_book

        params do
          required(:user).filled(type?: ::User)
          required(:book).filled(type?: Homebrew::Book)
          optional(:names).filled(:array).each(:string)
          optional(:ids).filled(:array).each(:string)
        end
      end

      private

      def do_prepare(input)
        input[:attributes] = ids(input).map do |id|
          {
            homebrew_book_id: input[:book].id,
            itemable_type: 'Daggerheart::Homebrew::Community',
            itemable_id: id
          }
        end
      end

      def do_persist(input)
        Homebrew::Book::Item.upsert_all(input[:attributes]) if input[:attributes].any?

        { result: :ok }
      end

      def ids(input)
        existing_community_ids = input[:book].items.where(itemable_type: 'Daggerheart::Homebrew::Community').pluck(:itemable_id)
        relation =
          Homebrew::Community
            .where(type: 'Daggerheart::Homebrew::Community', user_id: input[:user].id)
            .where.not(id: existing_community_ids)
        if input.key?(:ids)
          relation.where(id: input[:ids]).ids
        else
          relation.where(name: input[:names]).ids
        end
      end
    end
  end
end
