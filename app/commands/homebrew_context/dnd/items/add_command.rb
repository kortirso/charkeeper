# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Items
      class AddCommand < BaseCommand
        include Deps[
          formula: 'formula'
        ]

        use_contract do
          config.messages.namespace = :homebrew_item

          Kinds = Dry::Types['strict.string'].enum('item', 'potion', 'ammo', 'focus', 'tools', 'music', 'weapon')
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
            optional(:info).hash
            optional(:modifiers).hash
            optional(:consume).maybe(:array).each(:hash) do
              required(:id).filled(type?: Integer)
              required(:attribute).filled(ConsumeAttributes)
              required(:formula).filled(:string)
            end
            optional(:public).filled(:bool)
          end
        end

        private

        def do_prepare(input) # rubocop: disable Metrics/AbcSize
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

        def do_persist(input)
          result = ::Dnd5::Item.create!(input.except(:itemable_type, :itemable_id, :consume))

          { result: result }
        end
      end
    end
  end
end
