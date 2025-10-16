# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddBookDomainsCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_book

        params do
          required(:user).filled(type?: ::User)
          required(:book).filled(type?: Homebrew::Book)
          required(:names).filled(:array).each(:string)
        end
      end

      private

      def do_prepare(input)
        existing_domain_ids =
          input[:book].items.where(itemable_type: 'Daggerheart::Homebrew::Domain').pluck(:itemable_id)
        domain_ids =
          ::Daggerheart::Homebrew::Domain
            .where(user_id: input[:user].id, name: input[:names])
            .where.not(id: existing_domain_ids)
            .ids
        input[:attributes] = domain_ids.map do |domain_id|
          {
            homebrew_book_id: input[:book].id,
            itemable_type: 'Daggerheart::Homebrew::Domain',
            itemable_id: domain_id
          }
        end
      end

      def do_persist(input)
        Homebrew::Book::Item.upsert_all(input[:attributes]) if input[:attributes].any?

        { result: :ok }
      end
    end
  end
end
