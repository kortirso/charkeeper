# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Domains
        class AddCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.daggerheart.feats.add'
          ]

          private

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              domain = ::Daggerheart::Homebrews::Domain.create!(input.slice(:user, :title, :description, :public, :info))
              input[:features]&.each do |feature|
                add_feat.call(
                  feature.except(:id).merge({ origin_value: domain.id, no_refresh: true })
                )
              end
              domain
            end

            { result: result }
          end
        end
      end
    end
  end
end
