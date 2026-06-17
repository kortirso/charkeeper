# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Communities
        class AddCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.daggerheart.feats.add'
          ]

          # rubocop: disable Metrics/BlockLength
          use_contract do
            Kinds = Dry::Types['strict.string'].enum('static', 'text', 'update_result', 'hidden')
            Limits = Dry::Types['strict.string'].enum('short_rest', 'long_rest', 'session')

            params do
              required(:user).filled(type?: ::User)
              required(:title).hash do
                required(:en).filled(:string, max_size?: 50)
                optional(:ru).maybe(:string, max_size?: 50)
                optional(:es).maybe(:string, max_size?: 50)
              end
              required(:description).hash do
                required(:en).filled(:string, max_size?: 500)
                optional(:ru).maybe(:string, max_size?: 500)
                optional(:es).maybe(:string, max_size?: 500)
              end
              optional(:public).filled(:bool)
              required(:features).filled(:array, size?: 1).each(:hash) do
                required(:title).hash do
                  required(:en).filled(:string, max_size?: 50)
                  optional(:ru).maybe(:string, max_size?: 50)
                  optional(:es).maybe(:string, max_size?: 50)
                end
                required(:description).hash do
                  required(:en).filled(:string, max_size?: 500)
                  optional(:ru).maybe(:string, max_size?: 500)
                  optional(:es).maybe(:string, max_size?: 500)
                end
                required(:kind).filled(Kinds)
                optional(:limit).filled(:integer, gteq?: 1)
                optional(:limit_refresh).filled(Limits)
              end
            end
          end
          # rubocop: enable Metrics/BlockLength

          private

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
          end

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              community = ::Daggerheart::Homebrews::Community.create!(input.slice(:user, :title, :description, :public))
              input[:features].each do |feature|
                add_feat.call(
                  feature.merge({
                    user: input[:user], origin: 'community', origin_value: community.id, no_refresh: true
                  })
                )
              end
              community
            end

            { result: result }
          end
        end
      end
    end
  end
end
