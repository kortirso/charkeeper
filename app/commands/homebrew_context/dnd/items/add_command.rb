# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Items
      class AddCommand < BaseCommand
        include Deps[
          refresh_bonuses: 'commands.bonuses_context.refresh',
          formula: 'formula'
        ]

        use_contract do
          config.messages.namespace = :homebrew_item

          Kinds = Dry::Types['strict.string'].enum('item', 'potion', 'ammo', 'focus', 'tools', 'music')
          Types = Dry::Types['strict.string'].enum('Feat')
          ConsumeAttributes = Dry::Types['strict.string'].enum('health')

          params do
            required(:user).filled(type?: ::User)
            required(:name).filled(:string, max_size?: 50)
            required(:kind).filled(Kinds)
            optional(:description).maybe(:string, max_size?: 250)
            optional(:itemable_type).maybe(Types)
            optional(:itemable_id).maybe(:string, :uuid_v4?)
            optional(:data).hash
            optional(:bonuses).maybe(:array).each(:hash) do
              required(:id).filled(type_included_in?: [Integer, String])
              required(:type).filled(:string)
              required(:value)
            end
            optional(:consume).maybe(:array).each(:hash) do
              required(:id).filled(type?: Integer)
              required(:attribute).filled(ConsumeAttributes)
              required(:formula).filled(:string)
            end
            optional(:public).filled(:bool)
          end
        end

        private

        # rubocop: disable Style/GuardClause, Metrics/AbcSize
        def do_prepare(input)
          input[:name] = { en: input[:name], ru: input[:name] }
          input[:description] = { en: input[:description], ru: input[:description] }

          if input[:itemable_type] && input[:itemable_id]
            input[:itemable] =
              input[:itemable_type].constantize.where(user_id: input[:user].id).find_by(id: input[:itemable_id])
          end

          if input.key?(:consume)
            consume_result = input[:consume].select do |consume|
              result = formula.call(formula: consume[:formula])
              next unless result

              consume
            end
            input[:info] = { consume: consume_result } if consume_result.any?
          end
        end
        # rubocop: enable Style/GuardClause, Metrics/AbcSize

        def do_persist(input)
          result = ::Dnd5::Item.create!(input.except(:itemable_type, :itemable_id, :bonuses, :consume))

          refresh_bonuses.call(bonusable: result, bonuses: input[:bonuses]) if input[:bonuses]

          { result: result }
        end
      end
    end
  end
end
