# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Feats
        class AddCommand < BaseCommand
          include Deps[
            refresh_feats: 'services.characters_context.daggerheart.refresh_feats'
          ]

          use_contract do
            Origins =
              Dry::Types['strict.string'].enum(
                'ancestry', 'class', 'subclass', 'community', 'character', 'transformation', 'domain_card'
              )

            params do
              required(:user).filled(type?: ::User)
              required(:title).hash
              required(:description).hash
              required(:origin).filled(Origins)
              required(:origin_value).filled(:string)
              required(:kind).filled(:string)
              optional(:limit).filled(:integer)
              optional(:limit_refresh).filled(:string)
              optional(:subclass_mastery).filled(:integer)
              optional(:no_refresh).filled(:bool)
            end
          end

          private

          def do_prepare(input)
            if input[:origin] == 'subclass' && input.key?(:subclass_mastery)
              input[:conditions] = { subclass_mastery: input[:subclass_mastery] }
            end

            input[:description_eval_variables] = { limit: input[:limit].to_s } if input.key?(:limit)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
          end

          def do_persist(input)
            result = ::Daggerheart::Feat.create!(input.except(:limit, :no_refresh, :subclass_mastery))

            unless input.key?(:no_refresh)
              input[:user].characters.daggerheart.find_each { |character| refresh_feats.call(character: character) }
            end

            { result: result }
          end
        end
      end
    end
  end
end
