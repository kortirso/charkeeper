# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddItemCommand < BaseCommand
      include Deps[
        refresh_bonuses: 'commands.bonuses_context.refresh'
      ]

      use_contract do
        config.messages.namespace = :homebrew_item

        Kinds = Dry::Types['strict.string'].enum('item', 'consumable', 'primary weapon', 'secondary weapon', 'armor')
        Types = Dry::Types['strict.string'].enum('Feat')

        params do
          required(:user).filled(type?: ::User)
          required(:name).filled(:string, max_size?: 50)
          required(:kind).filled(Kinds)
          optional(:description).maybe(:string, max_size?: 250)
          optional(:itemable_type).maybe(Types)
          optional(:itemable_id).maybe(:string, :uuid_v4?)
          optional(:info).hash
          optional(:bonuses).maybe(:array).each(:hash) do
            required(:id).filled(type_included_in?: [Integer, String])
            required(:type).filled(:string)
            required(:value)
          end
          optional(:public).filled(:bool)
        end
      end

      private

      # rubocop: disable Style/GuardClause
      def do_prepare(input)
        input[:name] = { en: input[:name], ru: input[:name] }
        input[:description] = { en: input[:description], ru: input[:description] }

        if input[:itemable_type] && input[:itemable_id]
          input[:itemable] =
            input[:itemable_type].constantize.where(user_id: input[:user].id).find_by(id: input[:itemable_id])
        end
      end
      # rubocop: enable Style/GuardClause

      def do_persist(input)
        result = ::Daggerheart::Item.create!(input.except(:itemable_type, :itemable_id, :bonuses))

        refresh_bonuses.call(bonusable: result, bonuses: input[:bonuses]) if input[:bonuses]

        { result: result }
      end
    end
  end
end
