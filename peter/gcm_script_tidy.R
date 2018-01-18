# Three functions
# GCM does the GCM on character vectors containing training and test forms in DISC (or whatever)
# runGCMonVerbs fits the GCM (calling the GCM function) on the verbs data, doing the four verb classes (kept, sang, drove, burnt) separately. category A ends up being the regular training forms, so that the output gcm_reg is the regular weight. (if it's suspiciously low numbers, it ended up upside down somehow...)
# runGuyNoFeature calls the runGCMonVerbs on a given participant, creating the training file from the training data (Celex) + the ESP training for that person. you can loop it through the participant id-s to fit it on everyone.

# expects character vectors (and numbers for var_s and var_p, of course)
# category_A, category_B = the two training categories (e.g. regular / irregular)
# all_forms = c(category_A,category_B)

GCM <- function(test_forms,category_A,category_B,all_forms,var_s,var_p){
vector_sim_cat_A = as.numeric(NULL)
vector_sim_cat_B = as.numeric(NULL)

for (i in 1:length(test_forms)){
  form1 = test_forms[i]  
  
  vector_pairwise_sims_cat_A = as.numeric(NULL)
  
    for (ii in 1:length(category_A)){
      form2 = category_A[ii]
        dist = stringdist(form1,form2, method = 'lv')
          pairwise_sim = exp ( - dist / var_s )^var_p
            vector_pairwise_sims_cat_A[ii] = pairwise_sim
    }
  
  sum_pairwise_sims_cat_A = sum(vector_pairwise_sims_cat_A)
  
  vector_pairwise_sims_cat_B = as.numeric(NULL)
  
    for (ii in 1:length(category_B)){
      form2 = category_B[ii]
        dist = stringdist(form1,form2, method = 'lv')
          pairwise_sim = exp ( - dist / var_s )^var_p
            vector_pairwise_sims_cat_B[ii] = pairwise_sim
    }
  
  sum_pairwise_sims_cat_B = sum(vector_pairwise_sims_cat_B)
  
  vector_pairwise_sims_all_forms = as.numeric(NULL)
  
    for (ii in 1:length(all_forms)){
      form2 = all_forms[ii]
        dist = stringdist(form1,form2, method = 'lv')
          pairwise_sim = exp ( - dist / var_s )^var_p
            vector_pairwise_sims_all_forms[ii] = pairwise_sim
    }
  
  sum_pairwise_sims_all_forms = sum(vector_pairwise_sims_all_forms)
  
  sim_cat_A = sum_pairwise_sims_cat_A / sum_pairwise_sims_all_forms
  sim_cat_B = sum_pairwise_sims_cat_B / sum_pairwise_sims_all_forms
  
  vector_sim_cat_A[i] <- sim_cat_A
  vector_sim_cat_B[i] <- sim_cat_B

}

output_thing <- cbind(test_forms,vector_sim_cat_A,vector_sim_cat_B) %>% data.frame(options(stringsAsFactors = FALSE)) %>% rename(disc = test_forms) %>% mutate(weight_A = as.numeric(vector_sim_cat_A), weight_B = as.numeric(vector_sim_cat_B)) %>% select(disc,weight_A,weight_B)

return(output_thing)
}

runGCMonVerbs <- function(training,test){
var_s = 0.3
var_p = 1

output_things <- as.list(NULL)

for (i in 1:4){
moder_name <- c("KEPT","SANG","DROVE","BURNT")[i]

training_regular_forms <- training %>% filter(moder == moder_name,class == 'regular') %>% select(present) %>% pull %>% as.character
training_irregular_forms <- training %>% filter(moder == moder_name,class == 'irregular') %>% select(present) %>% pull %>% as.character
all_training_forms <- c(training_regular_forms,training_irregular_forms)
test_forms <- test %>% filter(moder == moder_name) %>% select(present) %>% pull %>% as.character
  
results_df <- GCM(test_forms,training_regular_forms,training_irregular_forms,all_training_forms,var_s,var_p)  

output_things[[i]] <- results_df

}

output_things_df <- do.call('rbind', output_things) %>% rename(gcm_regular_nof = weight_A) %>% select(disc,gcm_regular_nof)

return(output_things_df)

}

runGuyNoFeature <- function(espdata,training,person_id){

training_esp <- espdata %>% filter(participant_id==person_id, phase=='esp') %>% select(word,disc,moder,resp_bot_reg) %>% mutate(class = ifelse(resp_bot_reg==T, 'regular', 'irregular')) %>% select(disc,moder,class) %>% rename(present = disc)

training_corpus <- training %>% filter(!is.na(moder)) %>% select(present,moder,class)

training_person <- rbind(training_esp,training_corpus)

test_person <- espdata %>% filter(participant_id==person_id, phase=='test2') %>% select(disc,moder) %>% rename(present = disc)

results_person <- runGCMonVerbs(training_person,test_person) %>% rename(verb_esp_gcm3_reg = gcm_regular_nof) %>% mutate(participant_id = person_id)

return(results_person)

} 

# this bit of code shows the col names that the functions expect: phase (with test1, esp, test2 as levels); participant_id; resp_bot_reg.
esp3nonce <- esp3nonce %>% rename(word = target)
esp3nonce <- esp3nonce %>% select(-category) %>% merge(matcher)
esp3nonce$phase <- recode(esp3nonce$phase, postTest = 'test2', preTest = 'test1')
esp3nonce$participant_id <- esp3nonce$subject
esp3nonce$resp_bot_reg <- ifelse(as.character(esp3nonce$robotSelects) == as.character(esp3nonce$weakPast), T, F)
